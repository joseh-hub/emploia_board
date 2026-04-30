import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface TarefaTag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  created_by: string | null;
}

export interface TarefaTagAssignment {
  id: string;
  tarefa_id: string;
  tag_id: string;
  created_at: string;
  tag?: TarefaTag;
}

// Fetch all available tags
export function useTarefaTags() {
  return useQuery({
    queryKey: ["tarefa-tags"],
    queryFn: async (): Promise<TarefaTag[]> => {
      const { data, error } = await supabase
        .from("tarefa_tags")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

// Fetch tags assigned to a specific task
export function useTarefaTagAssignments(tarefaId: string | null) {
  return useQuery({
    queryKey: ["tarefa-tag-assignments", tarefaId],
    queryFn: async (): Promise<TarefaTagAssignment[]> => {
      if (!tarefaId) return [];

      const { data, error } = await supabase
        .from("tarefa_tag_assignments")
        .select(`
          *,
          tag:tarefa_tags(*)
        `)
        .eq("tarefa_id", tarefaId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!tarefaId,
  });
}

// Create a new tag
export function useCreateTarefaTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }): Promise<TarefaTag> => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("tarefa_tags")
        .insert({ name, color, created_by: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefa-tags"] });
      toast({
        title: "Tag criada",
        description: "A tag foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Assign a tag to a task
export function useAssignTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tarefaId, tagId }: { tarefaId: string; tagId: string }): Promise<void> => {
      const { error } = await supabase
        .from("tarefa_tag_assignments")
        .insert({ tarefa_id: tarefaId, tag_id: tagId });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tarefa-tag-assignments", variables.tarefaId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atribuir tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Remove a tag from a task
export function useUnassignTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tarefaId, tagId }: { tarefaId: string; tagId: string }): Promise<void> => {
      const { error } = await supabase
        .from("tarefa_tag_assignments")
        .delete()
        .eq("tarefa_id", tarefaId)
        .eq("tag_id", tagId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tarefa-tag-assignments", variables.tarefaId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete a tag completely
export function useDeleteTarefaTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagId: string): Promise<void> => {
      const { error } = await supabase
        .from("tarefa_tags")
        .delete()
        .eq("id", tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefa-tags"] });
      queryClient.invalidateQueries({ queryKey: ["tarefa-tag-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      toast({
        title: "Tag excluída",
        description: "A tag foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update a tag name/color
export function useUpdateTarefaTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name?: string; color?: string }): Promise<void> => {
      const { error } = await supabase
        .from("tarefa_tags")
        .update({ ...(name !== undefined && { name }), ...(color !== undefined && { color }) })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefa-tags"] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      toast({ title: "Tag atualizada" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar tag", description: error.message, variant: "destructive" });
    },
  });
}

// Update task dates
export function useUpdateTarefaDates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tarefaId,
      startDate,
      dueDate,
    }: {
      tarefaId: string;
      startDate: string | null;
      dueDate: string | null;
    }): Promise<void> => {
      const { error } = await supabase
        .from("projeto_tarefas")
        .update({
          start_date: startDate,
          due_date: dueDate,
        })
        .eq("id", tarefaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar datas",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
