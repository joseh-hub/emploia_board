import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Cadencia, Categoria } from "@/lib/checklistDates";

export interface ClienteChecklistTemplateItem {
  id: string;
  texto: string;
  position: number;
  dias_offset: number;
  cadencia: Cadencia;
  ocorrencias: number;
  categoria: Categoria;
  created_at: string;
  updated_at: string;
}

export function useClienteChecklistTemplate() {
  return useQuery({
    queryKey: ["cliente-checklist-template"],
    queryFn: async (): Promise<ClienteChecklistTemplateItem[]> => {
      const { data, error } = await supabase
        .from("cliente_checklist_template")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data || []) as ClienteChecklistTemplateItem[];
    },
  });
}

export function useAddTemplateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      texto: string;
      dias_offset?: number;
      cadencia?: Cadencia;
      ocorrencias?: number;
      categoria?: Categoria;
    }) => {
      const { data: existing } = await supabase
        .from("cliente_checklist_template")
        .select("position")
        .order("position", { ascending: false })
        .limit(1);
      const nextPos = (existing?.[0]?.position ?? -1) + 1;
      const { error } = await supabase.from("cliente_checklist_template").insert({
        texto: input.texto,
        position: nextPos,
        dias_offset: input.dias_offset ?? 0,
        cadencia: input.cadencia ?? "unica",
        ocorrencias: input.ocorrencias ?? 1,
        categoria: input.categoria ?? "outro",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cliente-checklist-template"] }),
    onError: (e: Error) =>
      toast({ title: "Erro ao adicionar item", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateTemplateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      texto?: string;
      dias_offset?: number;
      cadencia?: Cadencia;
      ocorrencias?: number;
      categoria?: Categoria;
    }) => {
      const { id, ...patch } = input;
      const { error } = await supabase
        .from("cliente_checklist_template")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cliente-checklist-template"] }),
    onError: (e: Error) =>
      toast({ title: "Erro ao editar item", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteTemplateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cliente_checklist_template").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cliente-checklist-template"] }),
    onError: (e: Error) =>
      toast({ title: "Erro ao remover item", description: e.message, variant: "destructive" }),
  });
}

export function useReorderTemplateItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; position: number }[]) => {
      for (const item of items) {
        const { error } = await supabase
          .from("cliente_checklist_template")
          .update({ position: item.position })
          .eq("id", item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cliente-checklist-template"] }),
    onError: (e: Error) =>
      toast({ title: "Erro ao reordenar", description: e.message, variant: "destructive" }),
  });
}
