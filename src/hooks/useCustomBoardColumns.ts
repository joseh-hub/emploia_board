import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface CustomBoardColumn {
  id: string;
  board_id: string;
  name: string;
  color: string;
  position: number;
  is_done_column: boolean;
  created_at: string;
  updated_at: string;
}

export const useCustomBoardColumns = (boardId: string | undefined) => {
  return useQuery({
    queryKey: ["custom-board-columns", boardId],
    queryFn: async () => {
      if (!boardId) return [];
      
      const { data, error } = await supabase
        .from("custom_board_columns")
        .select("*")
        .eq("board_id", boardId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as CustomBoardColumn[];
    },
    enabled: !!boardId,
  });
};

export const useCreateCustomBoardColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, name, color }: { boardId: string; name: string; color?: string }) => {
      // Get max position
      const { data: existing } = await supabase
        .from("custom_board_columns")
        .select("position")
        .eq("board_id", boardId)
        .order("position", { ascending: false })
        .limit(1);

      const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

      const { data, error } = await supabase
        .from("custom_board_columns")
        .insert({
          board_id: boardId,
          name,
          color: color || "#6366f1",
          position,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CustomBoardColumn;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["custom-board-columns", variables.boardId] });
      toast({
        title: "Coluna criada",
        description: "A nova coluna foi criada com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating column:", error);
      toast({
        title: "Erro ao criar coluna",
        description: "Não foi possível criar a coluna. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCustomBoardColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      boardId,
      ...updates
    }: Partial<CustomBoardColumn> & { id: string; boardId: string }) => {
      const { data, error } = await supabase
        .from("custom_board_columns")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, boardId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["custom-board-columns", result.boardId] });
    },
    onError: (error) => {
      console.error("Error updating column:", error);
      toast({
        title: "Erro ao atualizar coluna",
        description: "Não foi possível atualizar a coluna. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCustomBoardColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, boardId }: { id: string; boardId: string }) => {
      const { error } = await supabase
        .from("custom_board_columns")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { boardId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["custom-board-columns", result.boardId] });
      toast({
        title: "Coluna excluída",
        description: "A coluna foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error deleting column:", error);
      toast({
        title: "Erro ao excluir coluna",
        description: "Não foi possível excluir a coluna. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useReorderCustomBoardColumns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, columns }: { boardId: string; columns: { id: string; position: number }[] }) => {
      const updates = columns.map((col) =>
        supabase
          .from("custom_board_columns")
          .update({ position: col.position })
          .eq("id", col.id)
      );

      await Promise.all(updates);
      return { boardId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["custom-board-columns", result.boardId] });
    },
    onError: (error) => {
      console.error("Error reordering columns:", error);
      toast({
        title: "Erro ao reordenar colunas",
        description: "Não foi possível reordenar as colunas. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};
