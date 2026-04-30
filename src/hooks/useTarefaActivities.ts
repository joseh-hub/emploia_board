import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TarefaActivity {
  id: string;
  tarefa_id: string;
  user_id: string;
  action_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  description: string | null;
  created_at: string;
}

export function useTarefaActivities(tarefaId: string) {
  return useQuery({
    queryKey: ["tarefa-activities", tarefaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefa_activities")
        .select("*")
        .eq("tarefa_id", tarefaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TarefaActivity[];
    },
    enabled: !!tarefaId,
  });
}

export function useCreateTarefaActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      tarefaId,
      actionType,
      fieldName,
      oldValue,
      newValue,
      description,
    }: {
      tarefaId: string;
      actionType: string;
      fieldName?: string;
      oldValue?: string;
      newValue?: string;
      description?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tarefa_activities")
        .insert({
          tarefa_id: tarefaId,
          user_id: user.id,
          action_type: actionType,
          field_name: fieldName || null,
          old_value: oldValue || null,
          new_value: newValue || null,
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tarefa-activities", variables.tarefaId],
      });
    },
  });
}

// Helper hook to log activity easily
export function useLogTarefaActivity() {
  const createActivity = useCreateTarefaActivity();

  const logActivity = (params: {
    tarefaId: string;
    actionType: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    description?: string;
  }) => {
    createActivity.mutate(params);
  };

  return { logActivity, isLoading: createActivity.isPending };
}
