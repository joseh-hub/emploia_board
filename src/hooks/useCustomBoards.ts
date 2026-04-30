import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface CustomBoard {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  slug: string;
  visibility: "all" | "private" | "team" | "specific";
  allowed_users: string[];
  hide_overdue_columns: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CreateBoardData {
  name: string;
  description?: string;
  visibility: "all" | "private" | "specific";
  selectedUsers?: string[];
}

// Generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single
};

export const useCustomBoards = () => {
  return useQuery({
    queryKey: ["custom-boards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_boards")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as CustomBoard[];
    },
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (boardData: CreateBoardData) => {
      if (!user) throw new Error("User not authenticated");

      const slug = generateSlug(boardData.name);
      
      // Check if slug already exists
      const { data: existing } = await supabase
        .from("custom_boards")
        .select("id")
        .eq("slug", slug)
        .single();

      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      // For "specific" visibility, always include creator in allowed_users
      const allowedUsers =
        boardData.visibility === "specific"
          ? [...new Set([...(boardData.selectedUsers || []), user.id])]
          : [];

      const { data, error } = await supabase
        .from("custom_boards")
        .insert({
          name: boardData.name,
          description: boardData.description || null,
          slug: finalSlug,
          visibility: boardData.visibility,
          allowed_users: allowedUsers,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create DONE column automatically for new boards
      if (data) {
        await supabase.from("custom_board_columns").insert({
          board_id: data.id,
          name: "DONE",
          color: "#22c55e",
          position: 999, // Put at the end
          is_done_column: true,
        });
      }

      return data as CustomBoard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-boards"] });
      toast({
        title: "Board criado",
        description: "O novo board foi criado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating board:", error);
      toast({
        title: "Erro ao criar board",
        description: "Não foi possível criar o board. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CustomBoard> & { id: string }) => {
      const { data, error } = await supabase
        .from("custom_boards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as CustomBoard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-boards"] });
      toast({
        title: "Board atualizado",
        description: "O board foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error updating board:", error);
      toast({
        title: "Erro ao atualizar board",
        description: "Não foi possível atualizar o board. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("custom_boards")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-boards"] });
      toast({
        title: "Board excluído",
        description: "O board foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error deleting board:", error);
      toast({
        title: "Erro ao excluir board",
        description: "Não foi possível excluir o board. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};
