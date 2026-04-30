import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ChecklistSubitem {
  id: string;
  checklist_item_id: string;
  texto: string;
  concluido: boolean;
  position: number;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
}

export function useChecklistSubitems(checklistItemId: string | null) {
  return useQuery({
    queryKey: ["checklist-subitems", checklistItemId],
    queryFn: async (): Promise<ChecklistSubitem[]> => {
      if (!checklistItemId) return [];

      const { data, error } = await supabase
        .from("tarefa_checklist_subitems")
        .select("*")
        .eq("checklist_item_id", checklistItemId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as ChecklistSubitem[];
    },
    enabled: !!checklistItemId,
  });
}

export function useAddChecklistSubitem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      checklist_item_id,
      texto,
    }: {
      checklist_item_id: string;
      texto: string;
    }): Promise<ChecklistSubitem> => {
      // Get max position
      const { data: existing } = await supabase
        .from("tarefa_checklist_subitems")
        .select("position")
        .eq("checklist_item_id", checklist_item_id)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existing?.[0]?.position !== undefined ? existing[0].position + 1 : 0;

      const { data, error } = await supabase
        .from("tarefa_checklist_subitems")
        .insert({
          checklist_item_id,
          texto,
          position: nextPosition,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ChecklistSubitem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["checklist-subitems", variables.checklist_item_id] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao adicionar subitem", description: error.message, variant: "destructive" });
    },
  });
}

export function useToggleChecklistSubitem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      concluido,
      checklistItemId,
    }: {
      id: string;
      concluido: boolean;
      checklistItemId: string;
    }): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("tarefa_checklist_subitems")
        .update({
          concluido,
          completed_at: concluido ? new Date().toISOString() : null,
          completed_by: concluido ? user?.id : null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onMutate: async (variables) => {
      let previousCompletedAt: string | null = null;
      queryClient.setQueriesData<ChecklistSubitem[]>(
        { queryKey: ["checklist-subitems", variables.checklistItemId] },
        (oldData) => {
          if (!oldData) return oldData;
          const prev = oldData.find((i) => i.id === variables.id);
          if (prev) previousCompletedAt = prev.completed_at ?? null;
          return oldData.map((item) =>
            item.id === variables.id
              ? {
                  ...item,
                  concluido: variables.concluido,
                  completed_at: variables.concluido ? new Date().toISOString() : null,
                }
              : item
          );
        }
      );
      return { previousCompletedAt };
    },
    onError: (err, variables, context) => {
      queryClient.setQueriesData<ChecklistSubitem[]>(
        { queryKey: ["checklist-subitems", variables.checklistItemId] },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((item) =>
            item.id === variables.id
              ? {
                  ...item,
                  concluido: !variables.concluido,
                  completed_at: context?.previousCompletedAt ?? null,
                }
              : item
          );
        }
      );
      toast({ title: "Erro ao atualizar subitem", description: err.message, variant: "destructive" });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["checklist-subitems", variables.checklistItemId] });
    },
  });
}

export function useUpdateChecklistSubitem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      texto,
      checklistItemId,
    }: {
      id: string;
      texto: string;
      checklistItemId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from("tarefa_checklist_subitems")
        .update({ texto })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["checklist-subitems", variables.checklistItemId] });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar subitem", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteChecklistSubitem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      checklistItemId,
    }: {
      id: string;
      checklistItemId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from("tarefa_checklist_subitems")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["checklist-subitems", variables.checklistItemId] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir subitem", description: error.message, variant: "destructive" });
    },
  });
}

// Helper function to check if all subitems are completed
export function areAllSubitemsCompleted(subitems: ChecklistSubitem[]): boolean {
  if (subitems.length === 0) return true;
  return subitems.every((s) => s.concluido);
}

/**
 * Marca todos os itens de checklist e seus subitens como concluídos de uma vez.
 * Usado ao clicar em "concluir tarefa" no card do kanban.
 */
export function useCompleteAllChecklistsForTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tarefaId: string): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();

      // 1. Busca todos os itens de checklist da tarefa
      const { data: checklists, error: fetchError } = await supabase
        .from("tarefa_checklists")
        .select("id")
        .eq("tarefa_id", tarefaId);

      if (fetchError) throw fetchError;
      if (!checklists || checklists.length === 0) return;

      const checklistIds = checklists.map((c) => c.id);

      // 2. Marca todos os itens de checklist como concluídos
      const { error: checklistError } = await supabase
        .from("tarefa_checklists")
        .update({
          concluido: true,
          completed_at: now,
          completed_by: user?.id ?? null,
        })
        .eq("tarefa_id", tarefaId)
        .eq("concluido", false);

      if (checklistError) throw checklistError;

      // 3. Marca todos os subitens de todos os itens como concluídos
      const { error: subitemError } = await supabase
        .from("tarefa_checklist_subitems")
        .update({
          concluido: true,
          completed_at: now,
          completed_by: user?.id ?? null,
        })
        .in("checklist_item_id", checklistIds)
        .eq("concluido", false);

      if (subitemError) throw subitemError;
    },
    onSuccess: (_, tarefaId) => {
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas"] });
    },
    onError: (error) => {
      console.error("Erro ao concluir checklists:", error);
    },
  });
}
