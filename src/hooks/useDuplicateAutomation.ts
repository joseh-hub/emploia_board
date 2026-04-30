import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Automation } from "./useAutomations";

export function useDuplicateAutomation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (automation: Automation): Promise<void> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase.from("automations").insert({
        name: `${automation.name} (cópia)`,
        description: automation.description,
        trigger_type: automation.trigger_type,
        trigger_config: automation.trigger_config,
        action_type: automation.action_type,
        action_config: automation.action_config,
        entity_type: automation.entity_type,
        scope: automation.scope,
        board_id: automation.board_id,
        is_active: false,
        created_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast({ title: "Automação duplicada com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao duplicar automação", description: error.message, variant: "destructive" });
    },
  });
}
