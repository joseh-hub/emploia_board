import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BoardSettings {
  id: string;
  board_type: string;
  hide_overdue_columns: string[];
  created_at: string;
  updated_at: string;
}

export function useBoardSettings(boardType: "tarefas" | "projetos") {
  return useQuery({
    queryKey: ["board-settings", boardType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("board_settings")
        .select("*")
        .eq("board_type", boardType)
        .maybeSingle();

      if (error) throw error;
      return data as BoardSettings | null;
    },
  });
}

export function useUpdateBoardSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardType,
      hideOverdueColumns,
    }: {
      boardType: "tarefas" | "projetos";
      hideOverdueColumns: string[];
    }) => {
      const { data, error } = await supabase
        .from("board_settings")
        .update({ hide_overdue_columns: hideOverdueColumns, updated_at: new Date().toISOString() })
        .eq("board_type", boardType)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["board-settings", variables.boardType] });
    },
  });
}
