import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  expandTemplate,
  clusterFromTipo,
  type Cadencia,
  type Categoria,
  type Cluster,
} from "@/lib/checklistDates";

export interface ClienteChecklistItem {
  id: string;
  cliente_id: number;
  texto: string;
  concluido: boolean;
  position: number;
  due_date: string | null;
  nota: string | null;
  executado_em: string | null;
  categoria: Categoria;
  opcional: boolean;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useClienteChecklist(clienteId: number | undefined) {
  return useQuery({
    queryKey: ["cliente-checklist", clienteId],
    queryFn: async (): Promise<ClienteChecklistItem[]> => {
      if (!clienteId) return [];
      const { data, error } = await supabase
        .from("cliente_checklist_items")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data || []) as ClienteChecklistItem[];
    },
    enabled: !!clienteId,
  });
}

export function useAddClienteChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cliente_id,
      texto,
      due_date,
      categoria,
    }: {
      cliente_id: number;
      texto: string;
      due_date?: string | null;
      categoria?: Categoria;
    }) => {
      const { data: existing } = await supabase
        .from("cliente_checklist_items")
        .select("position")
        .eq("cliente_id", cliente_id)
        .order("position", { ascending: false })
        .limit(1);
      const nextPos = (existing?.[0]?.position ?? -1) + 1;
      const { error } = await supabase
        .from("cliente_checklist_items")
        .insert({
          cliente_id,
          texto,
          position: nextPos,
          due_date: due_date || null,
          categoria: categoria || "outro",
        });
      if (error) throw error;
      return cliente_id;
    },
    onSuccess: (cliente_id) => {
      queryClient.invalidateQueries({ queryKey: ["cliente-checklist", cliente_id] });
      queryClient.invalidateQueries({ queryKey: ["clientes-checklist-counts"] });
    },
    onError: (e: Error) =>
      toast({ title: "Erro ao adicionar item", description: e.message, variant: "destructive" }),
  });
}

export function useToggleClienteChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      concluido,
      clienteId,
      nota,
      executado_em,
    }: {
      id: string;
      concluido: boolean;
      clienteId: number;
      nota?: string | null;
      executado_em?: string | null;
    }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const update: Record<string, unknown> = {
        concluido,
        completed_at: concluido ? new Date().toISOString() : null,
        completed_by: concluido ? userRes.user?.id ?? null : null,
      };
      if (concluido) {
        if (nota !== undefined) update.nota = nota;
        if (executado_em !== undefined) update.executado_em = executado_em;
      } else {
        update.executado_em = null;
      }
      const { error } = await supabase
        .from("cliente_checklist_items")
        .update(update)
        .eq("id", id);
      if (error) throw error;
      return clienteId;
    },
    onSuccess: (clienteId) => {
      queryClient.invalidateQueries({ queryKey: ["cliente-checklist", clienteId] });
      queryClient.invalidateQueries({ queryKey: ["clientes-checklist-counts"] });
    },
    onError: (e: Error) =>
      toast({ title: "Erro ao atualizar item", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateClienteChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      clienteId,
      texto,
      due_date,
      categoria,
      nota,
      executado_em,
    }: {
      id: string;
      clienteId: number;
      texto?: string;
      due_date?: string | null;
      categoria?: Categoria;
      nota?: string | null;
      executado_em?: string | null;
    }) => {
      const update: Record<string, unknown> = {};
      if (texto !== undefined) update.texto = texto;
      if (due_date !== undefined) update.due_date = due_date;
      if (categoria !== undefined) update.categoria = categoria;
      if (nota !== undefined) update.nota = nota;
      if (executado_em !== undefined) update.executado_em = executado_em;
      const { error } = await supabase
        .from("cliente_checklist_items")
        .update(update)
        .eq("id", id);
      if (error) throw error;
      return clienteId;
    },
    onSuccess: (clienteId) => {
      queryClient.invalidateQueries({ queryKey: ["cliente-checklist", clienteId] });
    },
    onError: (e: Error) =>
      toast({ title: "Erro ao editar item", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteClienteChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, clienteId }: { id: string; clienteId: number }) => {
      const { error } = await supabase.from("cliente_checklist_items").delete().eq("id", id);
      if (error) throw error;
      return clienteId;
    },
    onSuccess: (clienteId) => {
      queryClient.invalidateQueries({ queryKey: ["cliente-checklist", clienteId] });
      queryClient.invalidateQueries({ queryKey: ["clientes-checklist-counts"] });
    },
    onError: (e: Error) =>
      toast({ title: "Erro ao remover item", description: e.message, variant: "destructive" }),
  });
}

export function useApplyDefaultChecklistToCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clienteId: number) => {
      const { data: template, error: tplErr } = await supabase
        .from("cliente_checklist_template")
        .select("texto, position, dias_offset, cadencia, ocorrencias, categoria")
        .order("position", { ascending: true });
      if (tplErr) throw tplErr;
      if (!template || template.length === 0) {
        throw new Error("Nenhum item no template padrão. Cadastre itens em Configurações.");
      }

      // Determine base date from metadata_clientes.data_inicio (fallback today).
      const { data: cli } = await supabase
        .from("metadata_clientes")
        .select("data_inicio")
        .eq("id", clienteId)
        .maybeSingle();
      const baseDate = cli?.data_inicio ? new Date(cli.data_inicio as string) : new Date();

      const expanded = expandTemplate(
        template.map((t) => ({
          texto: t.texto as string,
          position: (t.position as number) ?? 0,
          dias_offset: (t.dias_offset as number) ?? 0,
          cadencia: ((t.cadencia as Cadencia) || "unica"),
          ocorrencias: (t.ocorrencias as number) ?? 1,
          categoria: ((t.categoria as Categoria) || "outro"),
        })),
        baseDate
      );

      const rows = expanded.map((e) => ({
        cliente_id: clienteId,
        texto: e.texto,
        position: e.position,
        due_date: e.due_date,
        categoria: e.categoria,
      }));
      const { error } = await supabase.from("cliente_checklist_items").insert(rows);
      if (error) throw error;
      return clienteId;
    },
    onSuccess: (clienteId) => {
      queryClient.invalidateQueries({ queryKey: ["cliente-checklist", clienteId] });
      queryClient.invalidateQueries({ queryKey: ["clientes-checklist-counts"] });
      toast({ title: "Checklist aplicado", description: "O plano de sucesso foi gerado." });
    },
    onError: (e: Error) =>
      toast({ title: "Erro ao aplicar checklist", description: e.message, variant: "destructive" }),
  });
}
