import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// Helper to trigger card_done automation event and process it
async function triggerCardDoneEvent(
  cardId: string,
  boardId: string,
  cardData: Record<string, unknown>,
  userId: string
) {
  try {
    const eventData = {
      event_type: "card_done",
      entity_type: "custom_board_card",
      entity_id: cardId,
      board_id: boardId,
      card_data: cardData,
      user_id: userId,
    };

    await supabase.from("automation_events").insert([eventData] as never[]);

    // Invoke the execute-automation edge function to process the event immediately
    supabase.functions.invoke("execute-automation").catch((err) => {
      console.warn("execute-automation invoke failed (non-critical):", err);
    });
  } catch (error) {
    console.error("Failed to trigger card_done event:", error);
  }
}

export interface ChecklistSubitem {
  id: string;
  text: string;
  completed: boolean;
  completed_at?: string | null;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completed_at?: string | null;
  subitems?: ChecklistSubitem[];
}

export interface CardTag {
  name: string;
  color: string;
}

export interface CustomBoardCard {
  id: string;
  board_id: string;
  column_id: string | null;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  start_date: string | null;
  assigned_users: string[];
  tags: CardTag[];
  checklist: ChecklistItem[];
  attachments_count: number;
  comments_count: number;
  position: number;
  archived: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface CardFilters {
  search?: string;
  priority?: string[];
  assignedUsers?: string[];
  tags?: string[];
  archived?: boolean;
}

export const useCustomBoardCards = (boardId: string | undefined, filters?: CardFilters) => {
  return useQuery({
    queryKey: ["custom-board-cards", boardId, filters],
    queryFn: async () => {
      if (!boardId) return [];

      let query = supabase
        .from("custom_board_cards")
        .select("*")
        .eq("board_id", boardId)
        .eq("archived", filters?.archived ?? false)
        .order("position", { ascending: true });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.priority && filters.priority.length > 0) {
        query = query.in("priority", filters.priority);
      }

      if (filters?.assignedUsers && filters.assignedUsers.length > 0) {
        query = query.overlaps("assigned_users", filters.assignedUsers);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Parse JSON fields
      return (data || []).map((card) => ({
        ...card,
        tags: (card.tags as unknown as CardTag[]) || [],
        checklist: (card.checklist as unknown as ChecklistItem[]) || [],
      })) as CustomBoardCard[];
    },
    enabled: !!boardId,
  });
};

export const useCreateCustomBoardCard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      boardId,
      columnId,
      title,
      description,
    }: {
      boardId: string;
      columnId: string;
      title: string;
      description?: string;
    }) => {
      // Get max position in column
      const { data: existing } = await supabase
        .from("custom_board_cards")
        .select("position")
        .eq("column_id", columnId)
        .order("position", { ascending: false })
        .limit(1);

      const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

      const { data, error } = await supabase
        .from("custom_board_cards")
        .insert({
          board_id: boardId,
          column_id: columnId,
          title,
          description: description || null,
          position,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, boardId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["custom-board-cards", result.boardId] });
      toast({
        title: "Card criado",
        description: "O novo card foi criado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating card:", error);
      toast({
        title: "Erro ao criar card",
        description: "Não foi possível criar o card. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCustomBoardCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      boardId,
      tags,
      checklist,
      ...updates
    }: Partial<CustomBoardCard> & { id: string; boardId: string }) => {
      const updatePayload: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      if (tags !== undefined) {
        updatePayload.tags = JSON.parse(JSON.stringify(tags));
      }
      if (checklist !== undefined) {
        updatePayload.checklist = JSON.parse(JSON.stringify(checklist));
      }

      const { data, error } = await supabase
        .from("custom_board_cards")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, boardId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["custom-board-cards", result.boardId] });
    },
    onError: (error) => {
      console.error("Error updating card:", error);
      toast({
        title: "Erro ao atualizar card",
        description: "Não foi possível atualizar o card. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useMoveCustomBoardCard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      cardId,
      boardId,
      columnId,
      position,
    }: {
      cardId: string;
      boardId: string;
      columnId: string;
      position?: number;
    }) => {
      // Check if target column is a "done" column
      const { data: column } = await supabase
        .from("custom_board_columns")
        .select("is_done_column")
        .eq("id", columnId)
        .single();

      const updateData: Record<string, unknown> = {
        column_id: columnId,
        updated_at: new Date().toISOString(),
      };

      if (position !== undefined) {
        updateData.position = position;
      }

      const { data, error } = await supabase
        .from("custom_board_cards")
        .update(updateData)
        .eq("id", cardId)
        .select()
        .single();

      if (error) throw error;
      
      const isDoneColumn = column?.is_done_column === true;
      return { data, boardId, isDoneColumn };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["custom-board-cards", result.boardId] });
      
      // Trigger card_done event if moved to a done column
      if (result.isDoneColumn && user?.id) {
        triggerCardDoneEvent(
          result.data.id,
          result.boardId,
          result.data as unknown as Record<string, unknown>,
          user.id
        );
      }
    },
    onError: (error) => {
      console.error("Error moving card:", error);
      toast({
        title: "Erro ao mover card",
        description: "Não foi possível mover o card. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCustomBoardCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, boardId }: { id: string; boardId: string }) => {
      const { error } = await supabase
        .from("custom_board_cards")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { boardId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["custom-board-cards", result.boardId] });
      toast({
        title: "Card excluído",
        description: "O card foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error deleting card:", error);
      toast({
        title: "Erro ao excluir card",
        description: "Não foi possível excluir o card. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useArchiveCustomBoardCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, boardId, archived }: { id: string; boardId: string; archived: boolean }) => {
      const { data, error } = await supabase
        .from("custom_board_cards")
        .update({ archived, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, boardId };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["custom-board-cards", result.boardId] });
      toast({
        title: variables.archived ? "Card arquivado" : "Card restaurado",
        description: variables.archived
          ? "O card foi arquivado com sucesso."
          : "O card foi restaurado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error archiving card:", error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a operação. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};
