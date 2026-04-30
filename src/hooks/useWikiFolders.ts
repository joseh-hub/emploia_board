import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface WikiFolder {
  id: string;
  name: string;
  parent_id: string | null;
  folder_type: string;
  entity_id: string | null;
  entity_type: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  children?: WikiFolder[];
}

export function useWikiFolders() {
  return useQuery({
    queryKey: ["wiki-folders"],
    queryFn: async (): Promise<WikiFolder[]> => {
      const { data, error } = await supabase
        .from("wiki_folders")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as WikiFolder[];
    },
  });
}

export function useWikiFolderTree() {
  const { data: folders, ...rest } = useWikiFolders();

  const buildTree = (folders: WikiFolder[]): WikiFolder[] => {
    const folderMap = new Map<string, WikiFolder>();
    const rootFolders: WikiFolder[] = [];

    // First pass: create map
    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Second pass: build tree
    folders.forEach((folder) => {
      const current = folderMap.get(folder.id)!;
      if (folder.parent_id) {
        const parent = folderMap.get(folder.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(current);
        }
      } else {
        rootFolders.push(current);
      }
    });

    // Sort children alphabetically
    const sortChildren = (folder: WikiFolder) => {
      if (folder.children?.length) {
        folder.children.sort((a, b) => a.name.localeCompare(b.name));
        folder.children.forEach(sortChildren);
      }
    };
    rootFolders.forEach(sortChildren);

    return rootFolders;
  };

  return {
    ...rest,
    data: folders,
    tree: folders ? buildTree(folders) : [],
  };
}

export function useWikiFolder(folderId: string | null) {
  return useQuery({
    queryKey: ["wiki-folder", folderId],
    queryFn: async (): Promise<WikiFolder | null> => {
      if (!folderId) return null;

      const { data, error } = await supabase
        .from("wiki_folders")
        .select("*")
        .eq("id", folderId)
        .maybeSingle();

      if (error) throw error;
      return data as WikiFolder | null;
    },
    enabled: !!folderId,
  });
}

export function useWikiFolderPath(folderId: string | null) {
  const { data: folders } = useWikiFolders();

  const buildPath = (): WikiFolder[] => {
    if (!folders || !folderId) return [];

    const path: WikiFolder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = folders.find((f) => f.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parent_id;
      } else {
        break;
      }
    }

    return path;
  };

  return buildPath();
}

export function useCreateWikiFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      parentId,
    }: {
      name: string;
      parentId: string | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("wiki_folders")
        .insert({
          name,
          parent_id: parentId,
          folder_type: "manual",
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wiki-folders"] });
      toast({
        title: "Pasta criada",
        description: "A pasta foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar pasta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateWikiFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("wiki_folders")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wiki-folders"] });
      toast({
        title: "Pasta atualizada",
        description: "O nome da pasta foi alterado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar pasta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useMoveWikiFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      newParentId,
    }: {
      id: string;
      newParentId: string | null;
    }) => {
      const { data, error } = await supabase
        .from("wiki_folders")
        .update({ parent_id: newParentId })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wiki-folders"] });
      toast({
        title: "Pasta movida",
        description: "A pasta foi movida para o novo local.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao mover pasta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteWikiFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from("wiki_folders")
        .delete()
        .eq("id", folderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wiki-folders"] });
      toast({
        title: "Pasta excluída",
        description: "A pasta foi removida.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir pasta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
