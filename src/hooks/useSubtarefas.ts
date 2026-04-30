import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Subtarefa {
  id: string;
  projeto_id: string;
  parent_id: string;
  titulo: string;
  descricao: string | null;
  assigned_user: string | null;
  status: string;
  priorizado: boolean;
  depth: number;
  created_at: string;
  updated_at: string;
  // Recursive subtasks
  subtarefas?: Subtarefa[];
  // Progress
  subtarefas_count?: number;
  subtarefas_completed?: number;
}

export function useSubtarefas(parentId: string) {
  return useQuery({
    queryKey: ["subtarefas", parentId],
    queryFn: async (): Promise<Subtarefa[]> => {
      const { data, error } = await supabase
        .from("projeto_tarefas")
        .select("*")
        .eq("parent_id", parentId)
        .order("position", { ascending: true });

      if (error) throw error;

      // Map to ensure priorizado is always boolean
      return (data || []).map(item => ({
        ...item,
        priorizado: item.priorizado ?? false,
      })) as Subtarefa[];
    },
    enabled: !!parentId,
  });
}

export function useSubtarefasCount(parentId: string) {
  return useQuery({
    queryKey: ["subtarefas-count", parentId],
    queryFn: async (): Promise<{ total: number; completed: number }> => {
      const { data, error } = await supabase
        .from("projeto_tarefas")
        .select("status")
        .eq("parent_id", parentId);

      if (error) throw error;

      const total = data?.length || 0;
      const completed = data?.filter(t => t.status === "concluido").length || 0;

      return { total, completed };
    },
    enabled: !!parentId,
  });
}

export function useCreateSubtarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      parent_id: string;
      projeto_id: string;
      titulo: string;
      descricao?: string;
      assigned_user?: string;
    }): Promise<Subtarefa> => {
      // Get parent depth
      const { data: parent, error: parentError } = await supabase
        .from("projeto_tarefas")
        .select("depth")
        .eq("id", data.parent_id)
        .single();

      if (parentError) throw parentError;

      const newDepth = (parent?.depth ?? 0) + 1;

      // Get max position for ordering
      const { data: existing } = await supabase
        .from("projeto_tarefas")
        .select("position")
        .eq("parent_id", data.parent_id)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existing?.[0]?.position !== undefined ? existing[0].position + 1 : 0;

      const { data: subtarefa, error } = await supabase
        .from("projeto_tarefas")
        .insert({
          parent_id: data.parent_id,
          projeto_id: data.projeto_id,
          titulo: data.titulo,
          descricao: data.descricao || null,
          assigned_user: data.assigned_user || null,
          depth: newDepth,
          position: nextPosition,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...subtarefa, priorizado: subtarefa.priorizado ?? false } as Subtarefa;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subtarefas", variables.parent_id] });
      queryClient.invalidateQueries({ queryKey: ["subtarefas-count", variables.parent_id] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projeto_id] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      toast({ title: "Subtarefa criada" });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar subtarefa", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateSubtarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      parentId,
      projetoId,
      data,
    }: {
      id: string;
      parentId: string;
      projetoId: string;
      data: { titulo?: string; descricao?: string; assigned_user?: string; status?: string };
    }): Promise<void> => {
      const { error } = await supabase
        .from("projeto_tarefas")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subtarefas", variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ["subtarefas-count", variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteSubtarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      parentId,
      projetoId,
    }: {
      id: string;
      parentId: string;
      projetoId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from("projeto_tarefas")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subtarefas", variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ["subtarefas-count", variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      toast({ title: "Subtarefa excluída" });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });
}

export function useToggleSubtarefaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      parentId,
      projetoId,
      currentStatus,
    }: {
      id: string;
      parentId: string;
      projetoId: string;
      currentStatus: string;
    }): Promise<void> => {
      const newStatus = currentStatus === "concluido" ? "pendente" : "concluido";
      
      const { error } = await supabase
        .from("projeto_tarefas")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subtarefas", variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ["subtarefas-count", variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
    },
  });
}
