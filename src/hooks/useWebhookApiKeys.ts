import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface WebhookApiKey {
  id: string;
  name: string;
  key_preview: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export function useWebhookApiKeys() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["webhook-api-keys", user?.id],
    queryFn: async (): Promise<WebhookApiKey[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("webhook_api_keys")
        .select("id, name, key_preview, is_active, last_used_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "wh_";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function useCreateWebhookApiKey() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (name: string): Promise<{ key: string; id: string }> => {
      if (!user?.id) throw new Error("User not authenticated");

      const key = generateApiKey();
      const keyHash = await hashApiKey(key);
      const keyPreview = `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;

      const { data, error } = await supabase
        .from("webhook_api_keys")
        .insert({
          name,
          key_hash: keyHash,
          key_preview: keyPreview,
          user_id: user.id,
        })
        .select("id")
        .single();

      if (error) throw error;

      return { key, id: data.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-api-keys"] });
      toast({
        title: "API Key criada",
        description: "Copie a chave agora, ela não será exibida novamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar API Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteWebhookApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("webhook_api_keys")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-api-keys"] });
      toast({ title: "API Key excluída" });
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

export function useToggleWebhookApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("webhook_api_keys")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["webhook-api-keys"] });
      toast({
        title: isActive ? "API Key ativada" : "API Key desativada",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
