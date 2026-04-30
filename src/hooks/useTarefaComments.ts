import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { createMentionNotifications } from "@/lib/notifications";

export interface TarefaComment {
  id: string;
  tarefa_id: string;
  user_id: string;
  content: string;
  mentions: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useTarefaComments(tarefaId: string) {
  return useQuery({
    queryKey: ["tarefa-comments", tarefaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefa_comments")
        .select("*")
        .eq("tarefa_id", tarefaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TarefaComment[];
    },
    enabled: !!tarefaId,
  });
}

export function useCreateTarefaComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      tarefaId,
      content,
      mentions,
    }: {
      tarefaId: string;
      content: string;
      mentions?: string[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tarefa_comments")
        .insert({
          tarefa_id: tarefaId,
          user_id: user.id,
          content,
          mentions: mentions || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tarefa-comments", variables.tarefaId],
      });

      // Create mention notifications
      if (user && variables.mentions?.length) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        await createMentionNotifications(
          variables.mentions,
          user.id,
          profile?.full_name || user.email || "Alguém",
          "tarefa",
          variables.tarefaId
        );
      }
    },
  });
}

export function useDeleteTarefaComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      tarefaId,
    }: {
      commentId: string;
      tarefaId: string;
    }) => {
      const { error } = await supabase
        .from("tarefa_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tarefa-comments", variables.tarefaId],
      });
    },
  });
}
