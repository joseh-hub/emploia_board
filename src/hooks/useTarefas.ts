import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TarefaTag } from "./useTarefaTags";

export interface TarefaChecklist {
  id: string;
  tarefa_id: string;
  texto: string;
  concluido: boolean;
  priorizado: boolean;
  position: number;
  created_at: string;
  completed_at: string | null;
  completed_by: string | null;
}

export interface Tarefa {
  id: string;
  projeto_id: string;
  titulo: string;
  descricao: string | null;
  assigned_user: string | null;
  assigned_users: string[]; // NEW - primary source for multiple assignees
  status: string;
  priorizado: boolean;
  priority: string | null;
  column_id: string | null;
  start_date: string | null;
  due_date: string | null;
  template_id: string | null;
  message_sent: boolean;
  message_sent_at: string | null;
  created_at: string;
  updated_at: string;
  checklists?: TarefaChecklist[];
  tags?: TarefaTag[];
  projeto?: {
    project_id: string;
    company_name: string | null;
  };
}

// Helper to get assigned users with retrocompatibility
export function getAssignedUsers(tarefa: Tarefa): string[] {
  if (tarefa.assigned_users && tarefa.assigned_users.length > 0) {
    return tarefa.assigned_users;
  }
  if (tarefa.assigned_user) {
    return [tarefa.assigned_user];
  }
  return [];
}

export interface TarefaFilters {
  search?: string;
  projetoId?: string;
  responsavel?: string;
  status?: string;
  tagId?: string;
}

export function useTarefas(filters?: TarefaFilters) {
  return useQuery({
    queryKey: ["all-tarefas", filters],
    queryFn: async (): Promise<Tarefa[]> => {
      let query = supabase
        .from("projeto_tarefas")
        .select(`
          *,
          projeto:projetos(project_id, company_name)
        `)
        .eq("priorizado", true) // Sempre filtra apenas tarefas priorizadas
        .order("created_at", { ascending: false });

      // Apply additional filters
      if (filters?.projetoId) {
        query = query.eq("projeto_id", filters.projetoId);
      }
      if (filters?.responsavel) {
        query = query.overlaps("assigned_users", [filters.responsavel]);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.ilike("titulo", `%${filters.search}%`);
      }

      const { data: tarefas, error } = await query;

      if (error) throw error;

      // Fetch checklists and tags for each task
      const tarefasWithDetails = await Promise.all(
        (tarefas || []).map(async (tarefa) => {
          // Fetch checklists
          const { data: checklists } = await supabase
            .from("tarefa_checklists")
            .select("*")
            .eq("tarefa_id", tarefa.id)
            .order("position", { ascending: true });

          // Fetch tag assignments with tag data
          const { data: tagAssignments } = await supabase
            .from("tarefa_tag_assignments")
            .select(`
              tag_id,
              tag:tarefa_tags(*)
            `)
            .eq("tarefa_id", tarefa.id);

          const tags = tagAssignments
            ?.map((ta: any) => ta.tag)
            .filter(Boolean) || [];

          return {
            ...tarefa,
            priorizado: tarefa.priorizado ?? false,
            priority: tarefa.priority || 'medium',
            start_date: tarefa.start_date || null,
            due_date: tarefa.due_date || null,
            template_id: tarefa.template_id || null,
            message_sent: tarefa.message_sent ?? false,
            message_sent_at: tarefa.message_sent_at || null,
            assigned_users: tarefa.assigned_users || [],
            checklists: checklists || [],
            tags,
          } as Tarefa;
        })
      );

      // Filter by tag if specified
      if (filters?.tagId) {
        return tarefasWithDetails.filter((t) =>
          t.tags?.some((tag) => tag.id === filters.tagId)
        );
      }

      return tarefasWithDetails;
    },
  });
}

export function useMoveTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tarefaId,
      columnId,
      isDoneColumn,
    }: {
      tarefaId: string;
      columnId: string | null;
      isDoneColumn?: boolean;
    }): Promise<void> => {
      const updatePayload: any = { column_id: columnId };
      if (isDoneColumn) {
        updatePayload.status = "concluido";
        updatePayload.priorizado = false;
      }

      const { error } = await supabase
        .from("projeto_tarefas")
        .update(updatePayload)
        .eq("id", tarefaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao mover tarefa",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useToggleTarefaPrioridade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tarefaId,
      priorizado,
      projetoId,
    }: {
      tarefaId: string;
      priorizado: boolean;
      projetoId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from("projeto_tarefas")
        .update({ priorizado })
        .eq("id", tarefaId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      toast({
        title: variables.priorizado ? "Tarefa priorizada" : "Prioridade removida",
        description: variables.priorizado 
          ? "A tarefa foi marcada como prioridade." 
          : "A prioridade foi removida da tarefa.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar prioridade",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTarefaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tarefaId,
      status,
    }: {
      tarefaId: string;
      status: string;
    }): Promise<void> => {
      const updatePayload: any = { status };
      if (status === "concluido") {
        updatePayload.priorizado = false;
      }

      const { error } = await supabase
        .from("projeto_tarefas")
        .update(updatePayload)
        .eq("id", tarefaId);

      if (error) throw error;
    },
    onMutate: async ({ tarefaId, status }) => {
      // Cancel pending queries to avoid conflicts
      await queryClient.cancelQueries({ queryKey: ["all-tarefas"] });
      await queryClient.cancelQueries({ queryKey: ["projeto-tarefas"] });

      // Snapshot previous data for rollback
      const previousAllTarefas = queryClient.getQueriesData({ queryKey: ["all-tarefas"] });
      const previousProjetoTarefas = queryClient.getQueriesData({ queryKey: ["projeto-tarefas"] });

      // Optimistic update for all-tarefas
      queryClient.setQueriesData<Tarefa[]>(
        { queryKey: ["all-tarefas"] },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((tarefa) => {
            if (tarefa.id !== tarefaId) return tarefa;
            return status === "concluido"
              ? { ...tarefa, status, priorizado: false }
              : { ...tarefa, status };
          });
        }
      );

      // Optimistic update for projeto-tarefas
      queryClient.setQueriesData<Tarefa[]>(
        { queryKey: ["projeto-tarefas"] },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((tarefa) => {
            if (tarefa.id !== tarefaId) return tarefa;
            return status === "concluido"
              ? { ...tarefa, status, priorizado: false }
              : { ...tarefa, status };
          });
        }
      );

      return { previousAllTarefas, previousProjetoTarefas };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousAllTarefas) {
        context.previousAllTarefas.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousProjetoTarefas) {
        context.previousProjetoTarefas.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Revalidate to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas"] });
    },
  });
}

export function useDeleteTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tarefaId: string): Promise<void> => {
      const { error } = await supabase
        .from("projeto_tarefas")
        .delete()
        .eq("id", tarefaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas"] });
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir tarefa",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
