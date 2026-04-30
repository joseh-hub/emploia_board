import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface TarefaChecklist {
  id: string;
  tarefa_id: string;
  texto: string;
  concluido: boolean;
  priorizado: boolean;
  position: number;
  created_at: string;
  completed_at: string | null;
  completed_by: string | null;
}

export interface ProjetoTarefa {
  id: string;
  projeto_id: string;
  titulo: string;
  descricao: string | null;
  assigned_user: string | null;
  assigned_users: string[]; // NEW - primary source for multiple assignees
  status: string;
  priorizado: boolean;
  priority: string | null;
  column_id: string | null;
  start_date: string | null;
  due_date: string | null;
  template_id: string | null;
  message_sent: boolean;
  message_sent_at: string | null;
  created_at: string;
  updated_at: string;
  checklists?: TarefaChecklist[];
}

// Helper to get assigned users with retrocompatibility
export function getAssignedUsersFromTarefa(tarefa: ProjetoTarefa): string[] {
  if (tarefa.assigned_users && tarefa.assigned_users.length > 0) {
    return tarefa.assigned_users;
  }
  if (tarefa.assigned_user) {
    return [tarefa.assigned_user];
  }
  return [];
}

// Alias for convenience
export const getAssignedUsers = getAssignedUsersFromTarefa;

export function useProjetoTarefas(projetoId: string) {
  return useQuery({
    queryKey: ["projeto-tarefas", projetoId],
    queryFn: async (): Promise<ProjetoTarefa[]> => {
      const { data: tarefas, error } = await supabase
        .from("projeto_tarefas")
        .select("*")
        .eq("projeto_id", projetoId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch checklists for each task
      const tarefasWithChecklists = await Promise.all(
        (tarefas || []).map(async (tarefa) => {
          const { data: checklists } = await supabase
            .from("tarefa_checklists")
            .select("*")
            .eq("tarefa_id", tarefa.id)
            .order("position", { ascending: true });

          return {
            ...tarefa,
            priorizado: tarefa.priorizado ?? false,
            priority: tarefa.priority || null,
            assigned_users: tarefa.assigned_users || [],
            start_date: tarefa.start_date || null,
            due_date: tarefa.due_date || null,
            template_id: tarefa.template_id || null,
            message_sent: tarefa.message_sent ?? false,
            message_sent_at: tarefa.message_sent_at || null,
            checklists: checklists || [],
          } as ProjetoTarefa;
        })
      );

      return tarefasWithChecklists;
    },
    enabled: !!projetoId,
  });
}

export function useCreateProjetoTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projeto_id: string;
      titulo: string;
      descricao?: string;
      assigned_user?: string;
      assigned_users?: string[];
      column_id?: string;
      priority?: string;
      status?: string;
      priorizado?: boolean;
      start_date?: string;
      due_date?: string;
      template_id?: string;
    }): Promise<ProjetoTarefa> => {
      // Use assigned_users if provided, fallback to assigned_user
      const users = data.assigned_users?.length
        ? data.assigned_users
        : data.assigned_user
          ? [data.assigned_user]
          : [];

      const { data: tarefa, error } = await supabase
        .from("projeto_tarefas")
        .insert({
          projeto_id: data.projeto_id,
          titulo: data.titulo,
          descricao: data.descricao || null,
          assigned_user: users[0] || null, // Keep for retrocompatibility
          assigned_users: users,
          column_id: data.column_id || null,
          priority: data.priority || null,
          status: data.status || null,
          start_date: data.start_date || null,
          due_date: data.due_date || null,
          template_id: data.template_id || null,
          priorizado: data.priorizado ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...tarefa, assigned_users: tarefa.assigned_users || [] } as ProjetoTarefa;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projeto_id] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      toast({ title: "Tarefa criada", description: "A tarefa foi adicionada ao projeto." });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar tarefa", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateProjetoTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      projetoId,
      data,
    }: {
      id: string;
      projetoId: string;
      data: { titulo?: string; descricao?: string; assigned_user?: string; status?: string };
    }): Promise<void> => {
      const { error } = await supabase.from("projeto_tarefas").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar tarefa", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteProjetoTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projetoId }: { id: string; projetoId: string }): Promise<void> => {
      const { error } = await supabase.from("projeto_tarefas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      toast({ title: "Tarefa excluída", description: "A tarefa foi removida." });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir tarefa", description: error.message, variant: "destructive" });
    },
  });
}

// Helper to update checklist in cache
function updateChecklistInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  tarefaId: string,
  updateFn: (checklists: TarefaChecklist[]) => TarefaChecklist[]
) {
  // Update all-tarefas queries (with any filters)
  queryClient.setQueriesData<any[]>(
    { queryKey: ["all-tarefas"] },
    (oldData) => {
      if (!oldData) return oldData;
      return oldData.map((tarefa) => {
        if (tarefa.id === tarefaId && tarefa.checklists) {
          return {
            ...tarefa,
            checklists: updateFn(tarefa.checklists),
          };
        }
        return tarefa;
      });
    }
  );

  // Update projeto-tarefas queries
  queryClient.setQueriesData<ProjetoTarefa[]>(
    { queryKey: ["projeto-tarefas"] },
    (oldData) => {
      if (!oldData) return oldData;
      return oldData.map((tarefa) => {
        if (tarefa.id === tarefaId && tarefa.checklists) {
          return {
            ...tarefa,
            checklists: updateFn(tarefa.checklists),
          };
        }
        return tarefa;
      });
    }
  );
}

// Checklist mutations with optimistic updates
export function useAddChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tarefa_id,
      texto,
      projetoId,
    }: {
      tarefa_id: string;
      texto: string;
      projetoId: string;
    }): Promise<TarefaChecklist> => {
      // Get max position
      const { data: existing } = await supabase
        .from("tarefa_checklists")
        .select("position")
        .eq("tarefa_id", tarefa_id)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existing?.[0]?.position !== undefined ? existing[0].position + 1 : 0;

      const { data, error } = await supabase.from("tarefa_checklists").insert({
        tarefa_id,
        texto,
        position: nextPosition,
      }).select().single();

      if (error) throw error;
      return data as TarefaChecklist;
    },
    onMutate: async (variables) => {
      // Create temporary item for optimistic update
      const tempItem: TarefaChecklist = {
        id: `temp-${Date.now()}`,
        tarefa_id: variables.tarefa_id,
        texto: variables.texto,
        concluido: false,
        priorizado: false,
        position: 999,
        created_at: new Date().toISOString(),
        completed_at: null,
        completed_by: null,
      };

      // Update cache optimistically
      updateChecklistInCache(queryClient, variables.tarefa_id, (checklists) => [
        ...checklists,
        tempItem,
      ]);

      return { tempItem };
    },
    onError: (err, variables) => {
      // Remove the temp item on error
      updateChecklistInCache(queryClient, variables.tarefa_id, (checklists) =>
        checklists.filter((item) => !item.id.startsWith("temp-"))
      );
      toast({ title: "Erro ao adicionar item", description: err.message, variant: "destructive" });
    },
    onSuccess: (newItem, variables, context) => {
      // Replace temp item with real item
      updateChecklistInCache(queryClient, variables.tarefa_id, (checklists) =>
        checklists.map((item) =>
          item.id === context?.tempItem.id ? newItem : item
        )
      );
    },
    onSettled: (_, __, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
    },
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      concluido,
      tarefaId,
      projetoId,
    }: {
      id: string;
      concluido: boolean;
      tarefaId: string;
      projetoId: string;
    }): Promise<void> => {
      // Get current user for tracking who completed the item
      const { data: { user } } = await supabase.auth.getUser();

      const updateData = {
        concluido,
        completed_at: concluido ? new Date().toISOString() : null,
        completed_by: concluido ? user?.id : null,
      };

      const { error } = await supabase
        .from("tarefa_checklists")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onMutate: async (variables) => {
      let previousCompletedAt: string | null = null;
      updateChecklistInCache(queryClient, variables.tarefaId, (checklists) => {
        const prev = checklists.find((c) => c.id === variables.id);
        if (prev) previousCompletedAt = prev.completed_at ?? null;
        return checklists.map((item) =>
          item.id === variables.id
            ? {
                ...item,
                concluido: variables.concluido,
                completed_at: variables.concluido ? new Date().toISOString() : null,
              }
            : item
        );
      });
      return { previousCompletedAt };
    },
    onError: (err, variables, context) => {
      updateChecklistInCache(queryClient, variables.tarefaId, (checklists) =>
        checklists.map((item) =>
          item.id === variables.id
            ? {
                ...item,
                concluido: !variables.concluido,
                completed_at: context?.previousCompletedAt ?? null,
              }
            : item
        )
      );
      toast({ title: "Erro ao atualizar item", description: err.message, variant: "destructive" });
    },
    onSettled: (_, __, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
    },
  });
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      texto,
      tarefaId,
      projetoId,
    }: {
      id: string;
      texto: string;
      tarefaId: string;
      projetoId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from("tarefa_checklists")
        .update({ texto })
        .eq("id", id);

      if (error) throw error;
    },
    onMutate: async (variables) => {
      updateChecklistInCache(queryClient, variables.tarefaId, (checklists) =>
        checklists.map((item) =>
          item.id === variables.id ? { ...item, texto: variables.texto } : item
        )
      );
    },
    onError: (err) => {
      toast({ title: "Erro ao atualizar item", description: err.message, variant: "destructive" });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
    },
  });
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      tarefaId,
      projetoId,
    }: {
      id: string;
      tarefaId: string;
      projetoId: string;
    }): Promise<void> => {
      const { error } = await supabase.from("tarefa_checklists").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (variables) => {
      // Store removed item for potential rollback
      let removedItem: TarefaChecklist | undefined;

      updateChecklistInCache(queryClient, variables.tarefaId, (checklists) => {
        removedItem = checklists.find((item) => item.id === variables.id);
        return checklists.filter((item) => item.id !== variables.id);
      });

      return { removedItem };
    },
    onError: (err, variables, context) => {
      // Rollback: add item back
      if (context?.removedItem) {
        updateChecklistInCache(queryClient, variables.tarefaId, (checklists) => [
          ...checklists,
          context.removedItem!,
        ]);
      }
      toast({ title: "Erro ao excluir item", description: err.message, variant: "destructive" });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
    },
  });
}

export function useDuplicateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      tarefaId,
      projetoId,
    }: {
      id: string;
      tarefaId: string;
      projetoId: string;
    }): Promise<TarefaChecklist> => {
      // 1. Fetch the original checklist item
      const { data: original, error: fetchError } = await supabase
        .from("tarefa_checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !original) throw new Error("Erro ao buscar item original.");

      // 2. Fetch its subitems if any
      const { data: originalSubitems, error: fetchSubError } = await supabase
        .from("tarefa_checklist_subitems")
        .select("*")
        .eq("checklist_item_id", id)
        .order("position", { ascending: true });

      if (fetchSubError) throw new Error("Erro ao buscar sub-itens originais.");

      // 3. Get max position for checklist items
      const { data: existing } = await supabase
        .from("tarefa_checklists")
        .select("position")
        .eq("tarefa_id", tarefaId)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existing?.[0]?.position !== undefined ? existing[0].position + 1 : 0;

      // 4. Create the new cloned Checklist Item
      const { data: newChecklist, error: insertError } = await supabase
        .from("tarefa_checklists")
        .insert({
          tarefa_id: tarefaId,
          texto: `${original.texto} (Cópia)`,
          position: nextPosition,
          concluido: false, // Copies shouldn't necessarily be completed
          priorizado: original.priorizado,
        })
        .select()
        .single();

      if (insertError) throw new Error("Erro ao criar cópia do item.");

      // 5. Duplicate subitems if exist
      if (originalSubitems && originalSubitems.length > 0) {
        const subitemsToInsert = originalSubitems.map(subitem => ({
          checklist_item_id: newChecklist.id,
          texto: subitem.texto,
          position: subitem.position,
          concluido: false, // Reset completion status
        }));

        const { error: insertSubError } = await supabase
          .from("tarefa_checklist_subitems")
          .insert(subitemsToInsert);

        if (insertSubError) throw new Error("Erro ao copiar sub-itens.");
      }

      return newChecklist as TarefaChecklist;
    },
    onSuccess: (newChecklist, variables) => {
      // Update cache
      updateChecklistInCache(queryClient, variables.tarefaId, (checklists) => [
        ...checklists,
        newChecklist,
      ]);
      toast({ title: "Item duplicado", description: "O item e seus sub-itens foram duplicados." });
    },
    onError: (error) => {
      toast({ title: "Erro ao duplicar", description: error.message, variant: "destructive" });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
    },
  });
}

export function useReorderTarefaChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tarefaId,
      projetoId,
      orderedIds,
    }: {
      tarefaId: string;
      projetoId: string;
      orderedIds: string[];
    }): Promise<void> => {
      await Promise.all(
        orderedIds.map((id, index) =>
          supabase.from("tarefa_checklists").update({ position: index }).eq("id", id)
        )
      );
    },
    onMutate: async (variables) => {
      updateChecklistInCache(queryClient, variables.tarefaId, (checklists) => {
        const byId = new Map(checklists.map((c) => [c.id, c]));
        return variables.orderedIds.map((id) => byId.get(id)).filter(Boolean) as TarefaChecklist[];
      });
    },
    onError: (err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      toast({ title: "Erro ao reordenar", description: err.message, variant: "destructive" });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
    },
  });
}

export function useMarkMessageSent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tarefaId,
      projetoId,
      mensagem,
    }: {
      tarefaId: string;
      projetoId: string;
      mensagem: string;
    }): Promise<void> => {
      // 1. Buscar id_cliente do projeto
      const { data: projeto, error: projetoError } = await supabase
        .from("projetos")
        .select("id_cliente")
        .eq("project_id", projetoId)
        .maybeSingle();

      if (projetoError) throw projetoError;

      let groupId: string | null = null;

      if (projeto?.id_cliente) {
        // 2. Buscar group_id do cliente
        const { data: cliente, error: clienteError } = await supabase
          .from("metadata_clientes")
          .select("group_id")
          .eq("id", projeto.id_cliente)
          .maybeSingle();

        if (clienteError) throw clienteError;
        groupId = cliente?.group_id || null;
      }

      // 3. Enviar webhook via Edge Function se tiver group_id
      if (groupId) {
        const { error: fnError } = await supabase.functions.invoke("send-webhook-message", {
          body: { groupid: groupId, mensagem },
        });
        if (fnError) {
          console.error("Erro ao chamar Edge Function:", fnError);
        }
      } else {
        console.warn("group_id não encontrado para o projeto", projetoId);
      }

      // 4. Marcar como enviada no banco
      const { error } = await supabase
        .from("projeto_tarefas")
        .update({
          message_sent: true,
          message_sent_at: new Date().toISOString(),
        })
        .eq("id", tarefaId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      toast({ title: "Mensagem enviada com sucesso" });
    },
    onError: (error) => {
      toast({ title: "Erro ao enviar mensagem", description: error.message, variant: "destructive" });
    },
  });
}

export function useApplyTemplateToChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tarefaId,
      projetoId,
      templateId,
    }: {
      tarefaId: string;
      projetoId: string;
      templateId: string;
    }): Promise<void> => {
      // 1. Fetch template checklist items
      const { data: checklists, error } = await supabase
        .from("task_template_checklists")
        .select("*")
        .eq("template_id", templateId)
        .order("position", { ascending: true });

      if (error) throw error;
      if (!checklists || checklists.length === 0) return;

      // 2. Get current max position
      const { data: existing } = await supabase
        .from("tarefa_checklists")
        .select("position")
        .eq("tarefa_id", tarefaId)
        .order("position", { ascending: false })
        .limit(1);

      const startPosition = (existing?.[0]?.position ?? -1) + 1;

      // 3. Insert each checklist item and its subitems
      for (const [index, item] of checklists.entries()) {
        const { data: newItem, error: itemError } = await supabase
          .from("tarefa_checklists")
          .insert({
            tarefa_id: tarefaId,
            texto: item.texto,
            position: startPosition + index,
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // 4. Fetch and insert subitems
        const { data: subitems } = await supabase
          .from("task_template_checklist_subitems")
          .select("*")
          .eq("template_checklist_id", item.id)
          .order("position", { ascending: true });

        if (subitems && subitems.length > 0) {
          const { error: subError } = await supabase
            .from("tarefa_checklist_subitems")
            .insert(
              subitems.map((s, si) => ({
                checklist_item_id: newItem.id,
                texto: s.texto,
                position: si,
              }))
            );
          if (subError) throw subError;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projeto-tarefas", variables.projetoId] });
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
      queryClient.invalidateQueries({ queryKey: ["all-tarefas"] });
      toast({ title: "Template aplicado", description: "Itens adicionados ao checklist." });
    },
    onError: (error) => {
      toast({ title: "Erro ao aplicar template", description: error.message, variant: "destructive" });
    },
  });
}
