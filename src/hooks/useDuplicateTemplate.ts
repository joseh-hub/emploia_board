import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { TaskTemplate } from "./useTaskTemplates";

export function useDuplicateTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: TaskTemplate): Promise<void> => {
      if (!user?.id) throw new Error("User not authenticated");

      // Create new template
      const { data: newTemplate, error } = await supabase
        .from("task_templates")
        .insert({
          name: `${template.name} (cópia)`,
          description: template.description,
          titulo_padrao: template.titulo_padrao,
          descricao_padrao: template.descricao_padrao,
          assigned_user_padrao: template.assigned_user_padrao,
          projeto_id: template.projeto_id,
          is_global: template.is_global,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Copy checklists
      if (template.checklists && template.checklists.length > 0) {
        const checklistsData = template.checklists.map((item, index) => ({
          template_id: newTemplate.id,
          texto: item.texto,
          position: index,
        }));

        const { error: checklistError } = await supabase
          .from("task_template_checklists")
          .insert(checklistsData);

        if (checklistError) throw checklistError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      toast({ title: "Template duplicado com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao duplicar template", description: error.message, variant: "destructive" });
    },
  });
}
