import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClienteActivity {
  id: string;
  cliente_id: number;
  user_id: string;
  action_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  description: string | null;
  created_at: string;
}

export function useClienteActivities(clienteId: number) {
  return useQuery({
    queryKey: ["cliente-activities", clienteId],
    queryFn: async (): Promise<ClienteActivity[]> => {
      const { data, error } = await supabase
        .from("cliente_activities")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ClienteActivity[];
    },
    enabled: !!clienteId,
  });
}

export interface LogActivityInput {
  clienteId: number;
  actionType: string;
  fieldName?: string;
  oldValue?: string | null;
  newValue?: string | null;
  description?: string;
}

export function useLogClienteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LogActivityInput): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("cliente_activities")
        .insert({
          cliente_id: input.clienteId,
          user_id: user.id,
          action_type: input.actionType,
          field_name: input.fieldName || null,
          old_value: input.oldValue || null,
          new_value: input.newValue || null,
          description: input.description || null,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cliente-activities", variables.clienteId] });
    },
  });
}

// Helper to format field names for display
export function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    name: "Nome",
    status: "Status",
    Tipo: "Tipo",
    receita: "Receita",
    horas: "Horas",
    responsavelTecnico: "Responsáveis",
    column_id: "Coluna",
    description: "Descrição",
    cnpj: "CNPJ",
    dia_pagamento: "Dia de Pagamento",
    canal_aquisicao: "Canal de Aquisição",
    hs_resultado: "Health Score - Resultado",
    hs_suporte: "Health Score - Suporte",
    hs_inadimplencia: "Health Score - Inadimplência",
  };
  return fieldNames[field] || field;
}

// Helper to format action types for display
export function formatActionType(action: string): string {
  const actionTypes: Record<string, string> = {
    created: "Cliente criado",
    updated: "Campo atualizado",
    status_changed: "Status alterado",
    moved: "Movido para coluna",
    description_updated: "Descrição atualizada",
    comment_added: "Comentário adicionado",
  };
  return actionTypes[action] || action;
}
