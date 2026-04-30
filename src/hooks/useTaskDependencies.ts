import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type DependencyType = "blocks" | "blocked_by" | "relates_to";

export interface TaskDependency {
  id: string;
  tarefa_id: string;
  depends_on_id: string;
  dependency_type: DependencyType;
  created_at: string;
  // Joined data
  tarefa?: { titulo: string; status: string };
  depends_on?: { titulo: string; status: string };
}

export function useTaskDependencies(tarefaId: string) {
  return useQuery({
    queryKey: ["task-dependencies", tarefaId],
    queryFn: async (): Promise<{
      blocking: TaskDependency[];
      blockedBy: TaskDependency[];
      relatesTo: TaskDependency[];
    }> => {
      // Get dependencies where this task depends on others
      const { data: dependsOn, error: error1 } = await supabase
        .from("task_dependencies")
        .select(`
          *,
          depends_on:projeto_tarefas!task_dependencies_depends_on_id_fkey(titulo, status)
        `)
        .eq("tarefa_id", tarefaId);

      if (error1) throw error1;

      // Get dependencies where other tasks depend on this one
      const { data: dependedBy, error: error2 } = await supabase
        .from("task_dependencies")
        .select(`
          *,
          tarefa:projeto_tarefas!task_dependencies_tarefa_id_fkey(titulo, status)
        `)
        .eq("depends_on_id", tarefaId);

      if (error2) throw error2;

      const blocking = (dependedBy as TaskDependency[])?.filter(d => d.dependency_type === "blocks") || [];
      const blockedBy = (dependsOn as TaskDependency[])?.filter(d => d.dependency_type === "blocks") || [];
      const relatesTo = [...(dependsOn || []), ...(dependedBy || [])]
        .filter(d => d.dependency_type === "relates_to") as TaskDependency[];

      return { blocking, blockedBy, relatesTo };
    },
    enabled: !!tarefaId,
  });
}

export function useAddDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      tarefa_id: string;
      depends_on_id: string;
      dependency_type: DependencyType;
    }): Promise<TaskDependency> => {
      // Prevent self-dependency
      if (data.tarefa_id === data.depends_on_id) {
        throw new Error("Uma tarefa não pode depender de si mesma");
      }

      // Check for circular dependency
      const { data: existing } = await supabase
        .from("task_dependencies")
        .select("*")
        .eq("tarefa_id", data.depends_on_id)
        .eq("depends_on_id", data.tarefa_id);

      if (existing && existing.length > 0) {
        throw new Error("Isso criaria uma dependência circular");
      }

      const { data: dependency, error } = await supabase
        .from("task_dependencies")
        .insert(data)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Esta dependência já existe");
        }
        throw error;
      }

      return dependency as TaskDependency;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task-dependencies", variables.tarefa_id] });
      queryClient.invalidateQueries({ queryKey: ["task-dependencies", variables.depends_on_id] });
      toast({ title: "Dependência adicionada" });
    },
    onError: (error) => {
      toast({ title: "Erro ao adicionar dependência", description: error.message, variant: "destructive" });
    },
  });
}

export function useRemoveDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      tarefaId, 
      dependsOnId 
    }: { 
      id: string; 
      tarefaId: string; 
      dependsOnId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from("task_dependencies")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task-dependencies", variables.tarefaId] });
      queryClient.invalidateQueries({ queryKey: ["task-dependencies", variables.dependsOnId] });
      toast({ title: "Dependência removida" });
    },
    onError: (error) => {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    },
  });
}

// Batch query: returns Set of task IDs that are blocked by incomplete tasks
export function useBlockedTaskIds() {
  return useQuery({
    queryKey: ["blocked-task-ids"],
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase
        .from("task_dependencies")
        .select(`tarefa_id, depends_on:projeto_tarefas!task_dependencies_depends_on_id_fkey(status)`)
        .eq("dependency_type", "blocks");

      if (error) throw error;

      const blockedIds = new Set<string>();
      (data || []).forEach((dep: any) => {
        if (dep.depends_on?.status !== "concluido") {
          blockedIds.add(dep.tarefa_id);
        }
      });
      return blockedIds;
    },
    staleTime: 30_000,
  });
}

export function useCanCompleteTarefa(tarefaId: string) {
  return useQuery({
    queryKey: ["can-complete-tarefa", tarefaId],
    queryFn: async (): Promise<{ canComplete: boolean; blockers: string[] }> => {
      // Get all tasks that block this one
      const { data: blockers, error } = await supabase
        .from("task_dependencies")
        .select(`
          depends_on:projeto_tarefas!task_dependencies_depends_on_id_fkey(id, titulo, status)
        `)
        .eq("tarefa_id", tarefaId)
        .eq("dependency_type", "blocks");

      if (error) throw error;

      const incompleteBlockers = (blockers || [])
        .filter((b: any) => b.depends_on?.status !== "concluido")
        .map((b: any) => b.depends_on?.titulo || "Tarefa desconhecida");

      return {
        canComplete: incompleteBlockers.length === 0,
        blockers: incompleteBlockers,
      };
    },
    enabled: !!tarefaId,
  });
}
