import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ProjetoBoardColumn {
  id: string;
  name: string;
  color: string;
  position: number;
  is_done_column?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProjetoColumnInput {
  name: string;
  color?: string;
}

export interface UpdateProjetoColumnInput {
  id: string;
  name?: string;
  color?: string;
  position?: number;
}

export function useProjetoBoardColumns() {
  return useQuery({
    queryKey: ["projeto-board-columns"],
    queryFn: async (): Promise<ProjetoBoardColumn[]> => {
      const { data, error } = await supabase
        .from("projeto_board_columns")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateProjetoColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjetoColumnInput): Promise<ProjetoBoardColumn> => {
      const { data: columns } = await supabase
        .from("projeto_board_columns")
        .select("position")
        .order("position", { ascending: false })
        .limit(1);

      const maxPosition = columns?.[0]?.position ?? -1;

      const { data, error } = await supabase
        .from("projeto_board_columns")
        .insert({
          name: input.name,
          color: input.color || "#6366f1",
          position: maxPosition + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projeto-board-columns"] });
      toast({
        title: "Coluna criada",
        description: "A nova coluna foi adicionada ao board.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar coluna",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProjetoColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProjetoColumnInput): Promise<ProjetoBoardColumn> => {
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.position !== undefined) updateData.position = input.position;

      const { data, error } = await supabase
        .from("projeto_board_columns")
        .update(updateData)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projeto-board-columns"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar coluna",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProjetoColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (columnId: string): Promise<void> => {
      const { error } = await supabase
        .from("projeto_board_columns")
        .delete()
        .eq("id", columnId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projeto-board-columns"] });
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
      toast({
        title: "Coluna excluída",
        description: "A coluna foi removida do board.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir coluna",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
