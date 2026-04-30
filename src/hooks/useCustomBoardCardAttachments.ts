import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const BUCKET = "custom-board-attachments";
const SIGNED_URL_EXPIRY_SEC = 3600; // 1h

export type CustomBoardCardAttachment = {
  id: string;
  card_id: string;
  name: string;
  file_type: string;
  storage_path: string;
  size_bytes: number | null;
  created_by: string | null;
  created_at: string;
};

const queryKey = (cardId: string | null) => ["custom-board-card-attachments", cardId ?? ""];
const signedUrlQueryKey = (storagePath: string | null) =>
  ["custom-board-card-attachment-signed-url", storagePath ?? ""];

async function queryAttachments(cardId: string): Promise<CustomBoardCardAttachment[]> {
  const { data, error } = await (supabase as any)
    .from("custom_board_card_attachments")
    .select("*")
    .eq("card_id", cardId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CustomBoardCardAttachment[];
}

export function useCustomBoardCardAttachments(cardId: string | null) {
  return useQuery({
    queryKey: queryKey(cardId),
    queryFn: async (): Promise<CustomBoardCardAttachment[]> => {
      if (!cardId) return [];
      return queryAttachments(cardId);
    },
    enabled: !!cardId,
  });
}

export function useUploadCustomBoardCardAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cardId,
      boardId,
      file,
    }: {
      cardId: string;
      boardId: string;
      file: File;
    }): Promise<CustomBoardCardAttachment> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const storagePath = `${cardId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file);
      if (uploadError) throw uploadError;

      const { data, error } = await (supabase as any)
        .from("custom_board_card_attachments")
        .insert({
          card_id: cardId,
          name: file.name,
          file_type: ext || "other",
          storage_path: storagePath,
          size_bytes: file.size,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as CustomBoardCardAttachment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKey(variables.cardId) });
      queryClient.invalidateQueries({ queryKey: ["custom-board-cards", variables.boardId] });
      toast({ title: "Anexo adicionado", description: "O arquivo foi anexado ao card." });
    },
    onError: (err) => {
      toast({ title: "Erro ao anexar", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteCustomBoardCardAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      cardId,
      boardId,
      storagePath,
    }: {
      id: string;
      cardId: string;
      boardId: string;
      storagePath: string;
    }): Promise<void> => {
      const { error: delRow } = await (supabase as any)
        .from("custom_board_card_attachments")
        .delete()
        .eq("id", id);
      if (delRow) throw delRow;
      await supabase.storage.from(BUCKET).remove([storagePath]);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKey(variables.cardId) });
      queryClient.invalidateQueries({ queryKey: ["custom-board-cards", variables.boardId] });
      queryClient.removeQueries({ queryKey: signedUrlQueryKey(variables.storagePath) });
      toast({ title: "Anexo removido" });
    },
    onError: (err) => {
      toast({ title: "Erro ao remover anexo", description: err.message, variant: "destructive" });
    },
  });
}

export function useCustomBoardCardAttachmentSignedUrl(storagePath: string | null) {
  return useQuery({
    queryKey: signedUrlQueryKey(storagePath),
    queryFn: async (): Promise<string | null> => {
      if (!storagePath) return null;
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SEC);
      if (error) {
        console.error("Signed URL error:", error);
        return null;
      }
      return data.signedUrl;
    },
    enabled: !!storagePath,
    staleTime: (SIGNED_URL_EXPIRY_SEC - 60) * 1000,
  });
}
