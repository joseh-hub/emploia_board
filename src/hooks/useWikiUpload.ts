import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useWikiUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      folderId,
      file,
    }: {
      folderId: string;
      file: File;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuário não autenticado");

      // Determine file type
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      let fileType: string;

      if (extension === "md" || extension === "markdown") {
        fileType = "markdown";
      } else if (extension === "pdf") {
        fileType = "pdf";
      } else if (["doc", "docx"].includes(extension)) {
        fileType = "docx";
      } else if (["xls", "xlsx"].includes(extension)) {
        fileType = "xlsx";
      } else if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
        fileType = "image";
      } else {
        fileType = "other";
      }

      // Generate unique storage path
      const storagePath = `${folderId}/${crypto.randomUUID()}.${extension}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("wiki-files")
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Create file record
      const { data, error } = await supabase
        .from("wiki_files")
        .insert({
          folder_id: folderId,
          name: file.name,
          file_type: fileType,
          storage_path: storagePath,
          size_bytes: file.size,
          created_by: user.id,
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
        title: "Arquivo enviado",
        description: "O arquivo foi carregado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useWikiFileUrl(storagePath: string | null) {
  if (!storagePath) return null;

  const { data } = supabase.storage
    .from("wiki-files")
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function getWikiFileSignedUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("wiki-files")
    .createSignedUrl(storagePath, 3600); // 1 hour

  if (error) {
    console.error("Error getting signed URL:", error);
    return null;
  }

  return data.signedUrl;
}
