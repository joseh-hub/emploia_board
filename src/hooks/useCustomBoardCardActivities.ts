import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CustomBoardCardActivity {
  id: string;
  card_id: string;
  user_id: string;
  action_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  description: string | null;
  created_at: string;
}

export function useCustomBoardCardActivities(cardId: string) {
  return useQuery({
    queryKey: ["custom-board-card-activities", cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_board_card_activities")
        .select("*")
        .eq("card_id", cardId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CustomBoardCardActivity[];
    },
    enabled: !!cardId,
  });
}

export function useCreateCustomBoardCardActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      cardId,
      actionType,
      fieldName,
      oldValue,
      newValue,
      description,
    }: {
      cardId: string;
      actionType: string;
      fieldName?: string;
      oldValue?: string;
      newValue?: string;
      description?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("custom_board_card_activities")
        .insert({
          card_id: cardId,
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
        queryKey: ["custom-board-card-activities", variables.cardId],
      });
    },
  });
}

export function useLogCustomBoardCardActivity() {
  const createActivity = useCreateCustomBoardCardActivity();

  const logActivity = (params: {
    cardId: string;
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
