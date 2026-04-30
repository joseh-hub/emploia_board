import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface TaskTemplateChecklistSubitem {
  id: string;
  template_checklist_id: string;
  texto: string;
  position: number;
  created_at: string;
}

export interface TaskTemplateChecklist {
  id: string;
  template_id: string;
  texto: string;
  position: number;
  created_at: string;
  subitems?: TaskTemplateChecklistSubitem[];
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string | null;
  titulo_padrao: string;
  descricao_padrao: string | null;
  assigned_user_padrao: string | null;
  assigned_users_padrao: string[];
  projeto_id: string | null;
  is_global: boolean;
  is_default: boolean;
  send_message_on_complete: boolean;
  completion_message: string | null;
  due_days_offset: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  checklists?: TaskTemplateChecklist[];
}

export function useTaskTemplates(projetoId?: string) {
  return useQuery({
    queryKey: ["task-templates", projetoId],
    queryFn: async (): Promise<TaskTemplate[]> => {
      let query = supabase
        .from("task_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (projetoId) {
        // Get templates for this project or global templates
        query = query.or(`projeto_id.eq.${projetoId},is_global.eq.true`);
      }

      const { data: templates, error } = await query;

      if (error) throw error;

      // Fetch checklists with subitems for each template
      const templatesWithChecklists = await Promise.all(
        (templates || []).map(async (template) => {
          const { data: checklists } = await supabase
            .from("task_template_checklists")
            .select("*")
            .eq("template_id", template.id)
            .order("position", { ascending: true });

          // Fetch subitems for each checklist
          const checklistsWithSubitems: TaskTemplateChecklist[] = [];
          for (const checklist of (checklists || [])) {
            const { data: subitems } = await supabase
              .from("task_template_checklist_subitems")
              .select("*")
              .eq("template_checklist_id", checklist.id)
              .order("position", { ascending: true });

            checklistsWithSubitems.push({
              ...checklist,
              subitems: (subitems || []) as TaskTemplateChecklistSubitem[],
            });
          }

          return {
            ...template,
            assigned_users_padrao: template.assigned_users_padrao || [],
            checklists: checklistsWithSubitems,
          } as TaskTemplate;
        })
      );

      return templatesWithChecklists;
    },
  });
}

export function useCreateTaskTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      titulo_padrao: string;
      descricao_padrao?: string;
      assigned_user_padrao?: string;
      projeto_id?: string;
      is_global?: boolean;
      is_default?: boolean;
      send_message_on_complete?: boolean;
      completion_message?: string;
      due_days_offset?: number | null;
      checklists?: string[];
    }): Promise<TaskTemplate> => {
      if (!user?.id) throw new Error("User not authenticated");

      // Create template
      const { data: template, error } = await supabase
        .from("task_templates")
        .insert({
          name: data.name,
          description: data.description || null,
          titulo_padrao: data.titulo_padrao,
          descricao_padrao: data.descricao_padrao || null,
          assigned_user_padrao: data.assigned_user_padrao || null,
          projeto_id: data.projeto_id || null,
          is_global: data.is_global ?? false,
          is_default: data.is_default ?? false,
          send_message_on_complete: data.send_message_on_complete ?? false,
          completion_message: data.completion_message || null,
          due_days_offset: data.due_days_offset ?? null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create checklists if provided
      if (data.checklists && data.checklists.length > 0) {
        const checklistsData = data.checklists.map((texto, index) => ({
          template_id: template.id,
          texto,
          position: index,
        }));

        const { error: checklistError } = await supabase
          .from("task_template_checklists")
          .insert(checklistsData);

        if (checklistError) throw checklistError;
      }

      return template as TaskTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      toast({ title: "Template criado", description: "O template foi salvo com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar template", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateTaskTemplate() {
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
        titulo_padrao?: string;
        descricao_padrao?: string;
        assigned_user_padrao?: string;
        is_global?: boolean;
        is_default?: boolean;
        send_message_on_complete?: boolean;
        completion_message?: string;
        due_days_offset?: number | null;
      };
    }): Promise<void> => {
      const { error } = await supabase
        .from("task_templates")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      toast({ title: "Template atualizado" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteTaskTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("task_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      toast({ title: "Template excluído" });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });
}

export function useApplyTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      projetoId,
    }: {
      templateId: string;
      projetoId: string;
    }): Promise<void> => {
      // Get template
      const { data: template, error: templateError } = await supabase
        .from("task_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;

      // Get checklists with subitems
      const { data: checklists } = await supabase
        .from("task_template_checklists")
        .select("*")
        .eq("template_id", templateId)
        .order("position", { ascending: true });

      // Get subitems for all checklists
      const checklistIds = (checklists || []).map(c => c.id) as string[];
      let allSubitems: any[] = [];
      if (checklistIds.length > 0) {
        const { data } = await supabase
          .from("task_template_checklist_subitems")
          .select("*")
          .in("template_checklist_id", checklistIds)
          .order("position", { ascending: true });
        allSubitems = data || [];
      }

      // Determine assigned_users from template
      const assignedUsers = template.assigned_users_padrao?.length 
        ? template.assigned_users_padrao 
        : template.assigned_user_padrao 
          ? [template.assigned_user_padrao]
          : [];

      // Calculate due_date if template has due_days_offset
      let dueDate: string | null = null;
      if (template.due_days_offset != null) {
        const { data: projeto } = await supabase
          .from("projetos")
          .select("created_at")
          .eq("project_id", projetoId)
          .single();
        if (projeto?.created_at) {
          const createdAt = new Date(projeto.created_at);
          createdAt.setDate(createdAt.getDate() + template.due_days_offset);
          dueDate = createdAt.toISOString();
        }
      }

      // Create task
      const { data: tarefa, error: tarefaError } = await supabase
        .from("projeto_tarefas")
        .insert({
          projeto_id: projetoId,
          titulo: template.titulo_padrao,
          descricao: template.descricao_padrao,
          assigned_user: assignedUsers[0] || null,
          assigned_users: assignedUsers,
          template_id: templateId,
          due_date: dueDate,
        })
        .select()
        .single();

      if (tarefaError) throw tarefaError;

      // Create checklists for the new task
      if (checklists && checklists.length > 0) {
        for (const [index, item] of checklists.entries()) {
          // Insert the checklist item
          const { data: newChecklist, error: checklistError } = await supabase
            .from("tarefa_checklists")
            .insert({
              tarefa_id: tarefa.id,
              texto: item.texto,
              position: index,
            })
            .select()
            .single();

          if (checklistError) throw checklistError;

          // Get subitems for this checklist template
          const itemSubitems = allSubitems.filter(
            (s: any) => s.template_checklist_id === item.id
          );

          // Create subitems if any exist
          if (itemSubitems.length > 0) {
            const subitemsData = itemSubitems.map((subitem, subIndex) => ({
              checklist_item_id: newChecklist.id,
              texto: subitem.texto,
              position: subIndex,
            }));

            const { error: subitemsError } = await supabase
              .from("tarefa_checklist_subitems")
              .insert(subitemsData);

            if (subitemsError) throw subitemsError;
          }
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      toast({ title: "Template aplicado", description: "Uma nova tarefa foi criada a partir do template." });
    },
    onError: (error) => {
      toast({ title: "Erro ao aplicar template", description: error.message, variant: "destructive" });
    },
  });
}

export function useDefaultTemplates() {
  return useQuery({
    queryKey: ["task-templates", "defaults"],
    queryFn: async (): Promise<TaskTemplate[]> => {
      const { data: templates, error } = await supabase
        .from("task_templates")
        .select("*")
        .eq("is_default", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const templatesWithChecklists = await Promise.all(
        (templates || []).map(async (template) => {
          const { data: checklists } = await supabase
            .from("task_template_checklists")
            .select("*")
            .eq("template_id", template.id)
            .order("position", { ascending: true });

          const checklistsWithSubitems: TaskTemplateChecklist[] = [];
          for (const checklist of (checklists || [])) {
            const { data: subitems } = await supabase
              .from("task_template_checklist_subitems")
              .select("*")
              .eq("template_checklist_id", checklist.id)
              .order("position", { ascending: true });

            checklistsWithSubitems.push({
              ...checklist,
              subitems: (subitems || []) as TaskTemplateChecklistSubitem[],
            });
          }

          return {
            ...template,
            assigned_users_padrao: template.assigned_users_padrao || [],
            checklists: checklistsWithSubitems,
          } as TaskTemplate;
        })
      );

      return templatesWithChecklists;
    },
  });
}
