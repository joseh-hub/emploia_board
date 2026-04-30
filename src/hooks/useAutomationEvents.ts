import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AutomationEventData {
  event_type: string;
  entity_type: string;
  entity_id: string;
  board_id?: string | null;
  card_data?: Record<string, unknown>;
}

export function useCreateAutomationEvent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AutomationEventData) => {
      if (!user?.id) throw new Error("User not authenticated");

      const insertData = {
        event_type: data.event_type,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        board_id: data.board_id || null,
        card_data: data.card_data || {},
        user_id: user.id,
      };

      const { error } = await supabase
        .from("automation_events")
        .insert([insertData] as never[]);

      if (error) throw error;

      // Invoke execute-automation to process the event immediately
      supabase.functions.invoke("execute-automation").catch((err) => {
        console.warn("execute-automation invoke failed (non-critical):", err);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-events"] });
    },
  });
}

export function useCardDoneEvent() {
  const createEvent = useCreateAutomationEvent();

  return {
    triggerCardDone: async (
      cardId: string,
      boardId: string,
      cardData: Record<string, unknown>
    ) => {
      await createEvent.mutateAsync({
        event_type: "card_done",
        entity_type: "custom_board_card",
        entity_id: cardId,
        board_id: boardId,
        card_data: cardData,
      });
    },
    isPending: createEvent.isPending,
  };
}
