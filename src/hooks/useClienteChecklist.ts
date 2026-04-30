import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ClienteChecklistItem {
  id: string;
  cliente_id: number;
  texto: string;
  concluido: boolean;
  position: number;
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
    mutationFn: async ({ cliente_id, texto }: { cliente_id: number; texto: string }) => {
      const { data: existing } = await supabase
        .from("cliente_checklist_items")
        .select("position")
        .eq("cliente_id", cliente_id)
        .order("position", { ascending: false })
        .limit(1);
      const nextPos = (existing?.[0]?.position ?? -1) + 1;
      const { error } = await supabase
        .from("cliente_checklist_items")
        .insert({ cliente_id, texto, position: nextPos });
      if (error) throw error;
      return cliente_id;
    },
    onSuccess: (cliente_id) => {
      queryClient.invalidateQueries({ queryKey: ["cliente-checklist", cliente_id] });
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
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
    }: {
      id: string;
      concluido: boolean;
      clienteId: number;
    }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const update: Partial<ClienteChecklistItem> = {
        concluido,
        completed_at: concluido ? new Date().toISOString() : null,
        completed_by: concluido ? userRes.user?.id ?? null : null,
      };
      const { error } = await supabase
        .from("cliente_checklist_items")
        .update(update)
        .eq("id", id);
      if (error) throw error;
      return clienteId;
    },
    onSuccess: (clienteId) => {
      queryClient.invalidateQueries({ queryKey: ["cliente-checklist", clienteId] });
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
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
      texto,
      clienteId,
    }: {
      id: string;
      texto: string;
      clienteId: number;
    }) => {
      const { error } = await supabase
        .from("cliente_checklist_items")
        .update({ texto })
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
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
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
        .select("texto, position")
        .order("position", { ascending: true });
      if (tplErr) throw tplErr;
      if (!template || template.length === 0) {
        throw new Error("Nenhum item no template padrão. Cadastre itens em Configurações.");
      }
      const rows = template.map((t, idx) => ({
        cliente_id: clienteId,
        texto: t.texto,
        position: t.position ?? idx,
      }));
      const { error } = await supabase.from("cliente_checklist_items").insert(rows);
      if (error) throw error;
      return clienteId;
    },
    onSuccess: (clienteId) => {
      queryClient.invalidateQueries({ queryKey: ["cliente-checklist", clienteId] });
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast({ title: "Checklist aplicado", description: "O checklist padrão foi aplicado ao cliente." });
    },
    onError: (e: Error) =>
      toast({ title: "Erro ao aplicar checklist", description: e.message, variant: "destructive" }),
  });
}
