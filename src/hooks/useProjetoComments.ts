import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLogProjetoActivity } from "./useProjetoActivities";
import { createMentionNotifications } from "@/lib/notifications";

export interface ProjetoComment {
  id: string;
  projeto_id: string;
  user_id: string;
  content: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateProjetoCommentInput {
  projetoId: string;
  content: string;
  mentions?: string[];
}

export function useProjetoComments(projetoId: string | null) {
  return useQuery({
    queryKey: ["projeto-comments", projetoId],
    queryFn: async (): Promise<ProjetoComment[]> => {
      if (!projetoId) return [];

      const { data, error } = await supabase
        .from("projeto_comments")
        .select("*")
        .eq("projeto_id", projetoId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!projetoId,
  });
}

export function useCreateProjetoComment() {
  const queryClient = useQueryClient();
  const logActivity = useLogProjetoActivity();

  return useMutation({
    mutationFn: async (input: CreateProjetoCommentInput): Promise<ProjetoComment> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("projeto_comments")
        .insert({
          projeto_id: input.projetoId,
          user_id: user.id,
          content: input.content,
          mentions: input.mentions || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-comments", variables.projetoId] });
      logActivity.mutate({
        projetoId: variables.projetoId,
        actionType: "comment_added",
        description: "Adicionou um comentário",
      });

      // Create mention notifications
      if (variables.mentions?.length) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();

          await createMentionNotifications(
            variables.mentions,
            user.id,
            profile?.full_name || user.email || "Alguém",
            "projeto",
            variables.projetoId
          );
        }
      }

      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar comentário",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProjetoComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, projetoId }: { commentId: string; projetoId: string }): Promise<void> => {
      const { error } = await supabase
        .from("projeto_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-comments", variables.projetoId] });
      toast({
        title: "Comentário excluído",
        description: "O comentário foi removido.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir comentário",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
