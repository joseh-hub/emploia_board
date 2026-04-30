import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { createMentionNotifications } from "@/lib/notifications";

export interface CustomBoardCardComment {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  mentions: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useCustomBoardCardComments(cardId: string) {
  return useQuery({
    queryKey: ["custom-board-card-comments", cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_board_card_comments")
        .select("*")
        .eq("card_id", cardId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CustomBoardCardComment[];
    },
    enabled: !!cardId,
  });
}

export function useCreateCustomBoardCardComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      cardId,
      content,
      mentions,
    }: {
      cardId: string;
      content: string;
      mentions?: string[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("custom_board_card_comments")
        .insert({
          card_id: cardId,
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
        queryKey: ["custom-board-card-comments", variables.cardId],
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
          "custom_board_card",
          variables.cardId
        );
      }
    },
  });
}

export function useDeleteCustomBoardCardComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      cardId,
    }: {
      commentId: string;
      cardId: string;
    }) => {
      const { error } = await supabase
        .from("custom_board_card_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["custom-board-card-comments", variables.cardId],
      });
    },
  });
}
