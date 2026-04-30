import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface WikiFile {
  id: string;
  folder_id: string;
  name: string;
  file_type: string;
  content: string | null;
  storage_path: string | null;
  tarefa_id: string | null;
  size_bytes: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export function useWikiFiles(folderId: string | null) {
  return useQuery({
    queryKey: ["wiki-files", folderId],
    queryFn: async (): Promise<WikiFile[]> => {
      if (!folderId) return [];

      const { data, error } = await supabase
        .from("wiki_files")
        .select("*")
        .eq("folder_id", folderId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as WikiFile[];
    },
    enabled: !!folderId,
  });
}

export function useWikiFile(fileId: string | null) {
  return useQuery({
    queryKey: ["wiki-file", fileId],
    queryFn: async (): Promise<WikiFile | null> => {
      if (!fileId) return null;

      const { data, error } = await supabase
        .from("wiki_files")
        .select("*")
        .eq("id", fileId)
        .maybeSingle();

      if (error) throw error;
      return data as WikiFile | null;
    },
    enabled: !!fileId,
  });
}

export function useWikiFileByTarefa(tarefaId: string | null) {
  return useQuery({
    queryKey: ["wiki-file-tarefa", tarefaId],
    queryFn: async (): Promise<WikiFile | null> => {
      if (!tarefaId) return null;

      const { data, error } = await supabase
        .from("wiki_files")
        .select("*")
        .eq("tarefa_id", tarefaId)
        .maybeSingle();

      if (error) throw error;
      return data as WikiFile | null;
    },
    enabled: !!tarefaId,
  });
}

export function useCreateWikiFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      name,
      content = "",
    }: {
      folderId: string;
      name: string;
      content?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Ensure .md extension
      const fileName = name.endsWith(".md") ? name : `${name}.md`;

      const { data, error } = await supabase
        .from("wiki_files")
        .insert({
          folder_id: folderId,
          name: fileName,
          file_type: "markdown",
          content,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["wiki-files", variables.folderId],
      });
      toast({
        title: "Arquivo criado",
        description: "O arquivo foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar arquivo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateWikiFileContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data, error } = await supabase
        .from("wiki_files")
        .update({ content })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wiki-file", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["wiki-files", data.folder_id],
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRenameWikiFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("wiki_files")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wiki-file", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["wiki-files", data.folder_id],
      });
      toast({
        title: "Arquivo renomeado",
        description: "O nome do arquivo foi alterado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao renomear",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteWikiFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: WikiFile) => {
      // If file has storage path, delete from storage first
      if (file.storage_path) {
        const { error: storageError } = await supabase.storage
          .from("wiki-files")
          .remove([file.storage_path]);

        if (storageError) {
          console.error("Error deleting from storage:", storageError);
        }
      }

      const { error } = await supabase
        .from("wiki_files")
        .delete()
        .eq("id", file.id);

      if (error) throw error;
      return file;
    },
    onSuccess: (file) => {
      queryClient.invalidateQueries({
        queryKey: ["wiki-files", file.folder_id],
      });
      toast({
        title: "Arquivo excluído",
        description: "O arquivo foi removido.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export interface WikiSearchResult {
  id: string;
  name: string;
  file_type: string;
  folder_id: string;
  content: string | null;
  folder_name?: string;
}

export function useSearchWikiFiles(searchQuery: string) {
  return useQuery({
    queryKey: ["wiki-search", searchQuery],
    queryFn: async (): Promise<WikiSearchResult[]> => {
      if (!searchQuery || searchQuery.length < 2) return [];

      const searchLower = `%${searchQuery.toLowerCase()}%`;

      const { data, error } = await supabase
        .from("wiki_files")
        .select("id, name, file_type, folder_id, content")
        .or(`name.ilike.${searchLower},content.ilike.${searchLower}`)
        .order("name", { ascending: true })
        .limit(50);

      if (error) throw error;
      return (data || []) as WikiSearchResult[];
    },
    enabled: searchQuery.length >= 2,
  });
}

export function useMoveWikiFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      newFolderId,
      oldFolderId,
    }: {
      id: string;
      newFolderId: string;
      oldFolderId: string;
    }) => {
      const { data, error } = await supabase
        .from("wiki_files")
        .update({ folder_id: newFolderId })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, oldFolderId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["wiki-files", result.oldFolderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["wiki-files", result.data.folder_id],
      });
      toast({
        title: "Arquivo movido",
        description: "O arquivo foi movido para a nova pasta.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao mover arquivo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
