import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const BUCKET = "tarefa-attachments";
const SIGNED_URL_EXPIRY_SEC = 3600; // 1h

export type TarefaAttachment = {
  id: string;
  tarefa_id: string;
  name: string;
  file_type: string;
  storage_path: string;
  size_bytes: number | null;
  created_by: string | null;
  created_at: string;
};

const queryKey = (tarefaId: string | null) => ["tarefa-attachments", tarefaId ?? ""];
const signedUrlQueryKey = (storagePath: string | null) => ["tarefa-attachment-signed-url", storagePath ?? ""];

// Helper to query tarefa_attachments table (not in generated types)
async function queryAttachments(tarefaId: string): Promise<TarefaAttachment[]> {
  const { data, error } = await (supabase as any)
    .from("tarefa_attachments")
    .select("*")
    .eq("tarefa_id", tarefaId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TarefaAttachment[];
}

export function useTarefaAttachments(tarefaId: string | null) {
  return useQuery({
    queryKey: queryKey(tarefaId),
    queryFn: async (): Promise<TarefaAttachment[]> => {
      if (!tarefaId) return [];
      return queryAttachments(tarefaId);
    },
    enabled: !!tarefaId,
  });
}

export function useUploadTarefaAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tarefaId,
      file,
    }: {
      tarefaId: string;
      file: File;
    }): Promise<TarefaAttachment> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const storagePath = `${tarefaId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file);
      if (uploadError) throw uploadError;

      const { data, error } = await (supabase as any)
        .from("tarefa_attachments")
        .insert({
          tarefa_id: tarefaId,
          name: file.name,
          file_type: ext || "other",
          storage_path: storagePath,
          size_bytes: file.size,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as TarefaAttachment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKey(variables.tarefaId) });
      toast({ title: "Anexo adicionado", description: "O arquivo foi anexado à tarefa." });
    },
    onError: (err) => {
      toast({ title: "Erro ao anexar", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteTarefaAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      tarefaId,
      storagePath,
    }: {
      id: string;
      tarefaId: string;
      storagePath: string;
    }): Promise<void> => {
      const { error: delRow } = await (supabase as any)
        .from("tarefa_attachments")
        .delete()
        .eq("id", id);
      if (delRow) throw delRow;
      await supabase.storage.from(BUCKET).remove([storagePath]);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKey(variables.tarefaId) });
      queryClient.removeQueries({ queryKey: signedUrlQueryKey(variables.storagePath) });
      toast({ title: "Anexo removido" });
    },
    onError: (err) => {
      toast({ title: "Erro ao remover anexo", description: err.message, variant: "destructive" });
    },
  });
}

export function useTarefaAttachmentSignedUrl(storagePath: string | null) {
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
