import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export type TriggerType = "status_change" | "due_date" | "assignment" | "created" | "completed" | "card_done";
export type ActionType = "webhook" | "notification" | "move_column" | "assign" | "update_field";
export type EntityType = "tarefa" | "projeto" | "cliente";
export type ScopeType = "global" | "board";

export interface Automation {
  id: string;
  name: string;
  description: string | null;
  trigger_type: TriggerType;
  trigger_config: Json;
  action_type: ActionType;
  action_config: Json;
  entity_type: EntityType;
  is_active: boolean;
  scope: ScopeType | null;
  board_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  automation_id: string;
  trigger_data: Record<string, unknown> | null;
  action_result: Record<string, unknown> | null;
  status: "success" | "failed" | "pending";
  error_message: string | null;
  executed_at: string;
}

export function useAutomations() {
  return useQuery({
    queryKey: ["automations"],
    queryFn: async (): Promise<Automation[]> => {
      const { data, error } = await supabase
        .from("automations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Automation[]) || [];
    },
  });
}

export function useAutomationLogs(automationId?: string) {
  return useQuery({
    queryKey: ["automation-logs", automationId],
    queryFn: async (): Promise<AutomationLog[]> => {
      let query = supabase
        .from("automation_logs")
        .select("*")
        .order("executed_at", { ascending: false })
        .limit(100);

      if (automationId) {
        query = query.eq("automation_id", automationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as AutomationLog[]) || [];
    },
  });
}

export function useCreateAutomation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      trigger_type: TriggerType;
      trigger_config?: Json;
      action_type: ActionType;
      action_config?: Json;
      entity_type: EntityType;
      scope?: ScopeType;
      board_id?: string | null;
    }): Promise<Automation> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data: automation, error } = await supabase
        .from("automations")
        .insert({
          name: data.name,
          description: data.description || null,
          trigger_type: data.trigger_type,
          trigger_config: data.trigger_config || {},
          action_type: data.action_type,
          action_config: data.action_config || {},
          entity_type: data.entity_type,
          scope: data.scope || "global",
          board_id: data.board_id || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return automation as Automation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast({ title: "Automação criada", description: "A automação foi configurada com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar automação", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        trigger_type?: TriggerType;
        trigger_config?: Json;
        action_type?: ActionType;
        action_config?: Json;
        entity_type?: EntityType;
        is_active?: boolean;
        scope?: ScopeType;
        board_id?: string | null;
      };
    }): Promise<void> => {
      const updateData: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
      
      const { error } = await supabase
        .from("automations")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast({ title: "Automação atualizada" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<void> => {
      const { error } = await supabase
        .from("automations")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast({ 
        title: isActive ? "Automação ativada" : "Automação desativada",
        description: isActive ? "A automação está agora ativa." : "A automação foi pausada."
      });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("automations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast({ title: "Automação excluída" });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });
}
