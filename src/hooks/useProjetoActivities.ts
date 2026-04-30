import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjetoActivity {
  id: string;
  projeto_id: string;
  user_id: string;
  action_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  description: string | null;
  created_at: string;
}

export interface LogProjetoActivityInput {
  projetoId: string;
  actionType: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
}

export function useProjetoActivities(projetoId: string | null) {
  return useQuery({
    queryKey: ["projeto-activities", projetoId],
    queryFn: async (): Promise<ProjetoActivity[]> => {
      if (!projetoId) return [];

      const { data, error } = await supabase
        .from("projeto_activities")
        .select("*")
        .eq("projeto_id", projetoId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!projetoId,
  });
}

export function useLogProjetoActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LogProjetoActivityInput): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("projeto_activities")
        .insert({
          projeto_id: input.projetoId,
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
      queryClient.invalidateQueries({ queryKey: ["projeto-activities", variables.projetoId] });
    },
  });
}

export function formatProjetoFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    company_name: "Nome do Projeto",
    status: "Status",
    client_type: "Tipo de Cliente",
    business_type: "Tipo de Negócio",
    monthly_value: "Valor Mensal",
    implementation_value: "Valor de Implantação",
    horas: "Horas",
    v1_delivery_date: "Data Entrega V1",
    project_scope: "Escopo do Projeto",
    responsible_name: "Responsável",
    column_id: "Coluna",
    description: "Descrição",
    responsavelTecnico: "Responsáveis Técnicos",
    sinal_pago: "Sinal Pago",
  };
  return fieldNames[field] || field;
}

export function formatProjetoActionType(action: string): string {
  const actionTypes: Record<string, string> = {
    created: "criou o projeto",
    updated: "atualizou",
    status_changed: "alterou o status",
    moved: "moveu o projeto",
    description_updated: "atualizou a descrição",
    comment_added: "adicionou um comentário",
  };
  return actionTypes[action] || action;
}
