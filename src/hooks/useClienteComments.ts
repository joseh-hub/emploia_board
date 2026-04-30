import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { createMentionNotifications } from "@/lib/notifications";

export interface ClienteComment {
  id: string;
  cliente_id: number;
  user_id: string;
  content: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
}

export function useClienteComments(clienteId: number | null) {
  return useQuery({
    queryKey: ["cliente-comments", clienteId],
    queryFn: async (): Promise<ClienteComment[]> => {
      if (!clienteId) return [];
      
      const { data, error } = await supabase
        .from("cliente_comments")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ClienteComment[];
    },
    enabled: !!clienteId,
  });
}

export function useAddClienteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      clienteId, 
      content, 
      mentions = [] 
    }: { 
      clienteId: number; 
      content: string; 
      mentions?: string[] 
    }): Promise<ClienteComment> => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("cliente_comments")
        .insert({
          cliente_id: clienteId,
          user_id: userData.user.id,
          content,
          mentions,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ClienteComment;
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cliente-comments", variables.clienteId] });

      // Create mention notifications
      if (variables.mentions?.length) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle();

          await createMentionNotifications(
            variables.mentions,
            user.id,
            profile?.full_name || user.email || "Alguém",
            "cliente",
            String(variables.clienteId)
          );
        }
      }

      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi salvo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar comentário",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteClienteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, clienteId }: { commentId: string; clienteId: number }): Promise<void> => {
      const { error } = await supabase
        .from("cliente_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cliente-comments", variables.clienteId] });
      toast({
        title: "Comentário excluído",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir comentário",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateClienteDescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clienteId, description }: { clienteId: number; description: string }): Promise<void> => {
      // Get current description for activity log
      const { data: currentData } = await supabase
        .from("metadata_clientes")
        .select("description")
        .eq("id", clienteId)
        .maybeSingle();

      const oldDescription = currentData?.description || "";

      const { error } = await supabase
        .from("metadata_clientes")
        .update({ description })
        .eq("id", clienteId);

      if (error) throw error;

      // Log activity if description changed
      if (oldDescription !== description) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("cliente_activities").insert({
            cliente_id: clienteId,
            user_id: user.id,
            action_type: "description_updated",
            field_name: "description",
            old_value: oldDescription ? oldDescription.substring(0, 100) + (oldDescription.length > 100 ? "..." : "") : null,
            new_value: description ? description.substring(0, 100) + (description.length > 100 ? "..." : "") : null,
          });
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["cliente-activities", variables.clienteId] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar descrição",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
