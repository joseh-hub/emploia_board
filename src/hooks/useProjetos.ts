import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { differenceInDays } from "date-fns";

export interface Projeto {
  project_id: string;
  project_name: string | null;
  company_name: string | null;
  status: string | null;
  client_type: string | null;
  business_type: string | null;
  monthly_value: number | null;
  implementation_value: number | null;
  horas: number | null;
  v1_delivery_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  responsavelTecnico: string[] | null;
  responsavel_horas: Record<string, number> | null;
  id_cliente: number | null;
  column_id: string | null;
  cnpj: string | null;
  site: string | null;
  responsible_name: string | null;
  responsible_email: string | null;
  responsible_whatsapp: string | null;
  financial_email: string | null;
  financial_whatsapp: string | null;
  project_scope: string | null;
  proposal_link: string | null;
  company_context: string | null;
  negotiation_details: string | null;
  additional_info: string | null;
  integrations: unknown | null;
  platforms: unknown | null;
  sinal_pago: boolean | null;
  monthly_date: number | null;
  timing: string | null;
  // Enriched: current stage info
  stage_due_date: string | null;
  stage_name: string | null;
}

export interface ProjetoFilters {
  search?: string;
  status?: string[];
  cliente?: number;
}

export function useProjetos(filters?: ProjetoFilters) {
  return useQuery({
    queryKey: ["projetos", filters],
    queryFn: async (): Promise<Projeto[]> => {
      let query = supabase
        .from("projetos")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.cliente) {
        query = query.eq("id_cliente", filters.cliente);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch board columns to resolve column_id → column name
      const { data: columns } = await supabase
        .from("projeto_board_columns")
        .select("id, name");
      const columnMap: Record<string, string> = {};
      for (const col of (columns || [])) {
        columnMap[col.id] = col.name;
      }

      const projectIds = (data || []).map(p => p.project_id);

      // Fetch current stage (first pending task) for each project (for display)
      let stageMap: Record<string, { due_date: string | null; titulo: string }> = {};
      if (projectIds.length > 0) {
        const { data: tasks } = await supabase
          .from("projeto_tarefas")
          .select("projeto_id, due_date, titulo, status")
          .in("projeto_id", projectIds)
          .is("parent_id", null)
          .order("created_at", { ascending: true });

        for (const task of (tasks || [])) {
          if (stageMap[task.projeto_id]) continue;
          if (task.status !== "concluido") {
            stageMap[task.projeto_id] = { due_date: task.due_date, titulo: task.titulo };
          }
        }
      }

      let result = (data || []).map(item => {
        const stageName = stageMap[item.project_id]?.titulo || null;
        const columnName = item.column_id ? columnMap[item.column_id] || null : null;
        const calculatedTiming = calculateTiming(item.created_at, columnName);
        return {
          ...item,
          responsavelTecnico: Array.isArray(item.responsavelTecnico) 
            ? item.responsavelTecnico as string[]
            : null,
          responsavel_horas: typeof item.responsavel_horas === 'object' 
            ? item.responsavel_horas as Record<string, number>
            : null,
          stage_due_date: stageMap[item.project_id]?.due_date || null,
          stage_name: stageName,
          timing: calculatedTiming,
        };
      }) as Projeto[];

      // Sync timing to DB silently for divergent values
      const updates = result.filter(p => {
        const dbTiming = (data || []).find(d => d.project_id === p.project_id)?.timing;
        return p.timing !== null && p.timing !== dbTiming;
      });
      if (updates.length > 0) {
        Promise.all(updates.map(p =>
          supabase.from("projetos").update({ timing: p.timing }).eq("project_id", p.project_id)
        )).catch(() => {});
      }

      // Apply client-side filters
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(p => 
          p.company_name?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.status?.length) {
        result = result.filter(p => filters.status!.includes(p.status || ""));
      }

      return result;
    },
  });
}

const STAGE_ORDER = ["Onboarding", "Desenvolvimento", "Produção", "Métricas"];
const STAGE_DEADLINES: Record<string, number> = {
  "Onboarding": 5,
  "Desenvolvimento": 25,
  "Produção": 30,
  "Métricas": 60,
};

function calculateTiming(createdAt: string | null, stageName: string | null): string | null {
  if (!createdAt || !stageName) return null;
  const currentIndex = STAGE_ORDER.indexOf(stageName);
  if (currentIndex === -1) return null;

  const daysSince = differenceInDays(new Date(), new Date(createdAt));

  // Find expected stage: last stage whose D+X <= daysSince
  let expectedIndex = -1;
  for (let i = 0; i < STAGE_ORDER.length; i++) {
    if (STAGE_DEADLINES[STAGE_ORDER[i]] <= daysSince) {
      expectedIndex = i;
    }
  }
  // If no deadline has passed yet, expected is stage 0
  if (expectedIndex === -1) expectedIndex = 0;

  if (currentIndex < expectedIndex) return "ATRASADO";
  if (currentIndex > expectedIndex) return "ADIANTADO";
  return "ONTIME";
}

export function useProjeto(id: string) {
  return useQuery({
    queryKey: ["projeto", id],
    queryFn: async (): Promise<Projeto | null> => {
      const { data, error } = await supabase
        .from("projetos")
        .select("*")
        .eq("project_id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch board columns to resolve column name
      const { data: columns } = await supabase
        .from("projeto_board_columns")
        .select("id, name");
      const columnMap: Record<string, string> = {};
      for (const col of (columns || [])) {
        columnMap[col.id] = col.name;
      }

      // Fetch current stage for display
      const { data: tasks } = await supabase
        .from("projeto_tarefas")
        .select("due_date, titulo, status")
        .eq("projeto_id", id)
        .is("parent_id", null)
        .order("created_at", { ascending: true });

      const currentStage = (tasks || []).find(t => t.status !== "concluido");
      const stageName = currentStage?.titulo || null;
      const columnName = data.column_id ? columnMap[data.column_id] || null : null;
      const calculatedTiming = calculateTiming(data.created_at, columnName);

      // Sync timing if divergent
      if (calculatedTiming !== null && calculatedTiming !== data.timing) {
        supabase.from("projetos").update({ timing: calculatedTiming }).eq("project_id", id).then(() => {});
      }

      return {
        ...data,
        responsavelTecnico: Array.isArray(data.responsavelTecnico) 
          ? data.responsavelTecnico as string[]
          : null,
        responsavel_horas: typeof data.responsavel_horas === 'object' 
          ? data.responsavel_horas as Record<string, number>
          : null,
        stage_due_date: currentStage?.due_date || null,
        stage_name: stageName,
        timing: calculatedTiming,
      } as Projeto;
    },
    enabled: !!id,
  });
}

export function useMoveProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projetoId, columnId }: { projetoId: string; columnId: string }): Promise<void> => {
      const { error } = await supabase
        .from("projetos")
        .update({ column_id: columnId })
        .eq("project_id", projetoId);

      if (error) throw error;

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("projeto_activities").insert({
          projeto_id: projetoId,
          user_id: user.id,
          action_type: "moved",
          field_name: "column_id",
          new_value: columnId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao mover projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, oldData }: { id: string; data: Record<string, unknown>; oldData?: Record<string, unknown> }): Promise<void> => {
      const { error } = await supabase
        .from("projetos")
        .update(data)
        .eq("project_id", id);

      if (error) throw error;

      // Log activities for tracked fields
      const { data: { user } } = await supabase.auth.getUser();
      if (user && oldData) {
        const fieldsToTrack = [
          "company_name", "status", "client_type", "monthly_value",
          "implementation_value", "horas", "v1_delivery_date",
          "project_scope", "responsible_name"
        ];

        for (const field of fieldsToTrack) {
          const oldValue = oldData[field];
          const newValue = data[field];
          if (newValue !== undefined && String(newValue) !== String(oldValue)) {
            await supabase.from("projeto_activities").insert({
              projeto_id: id,
              user_id: user.id,
              action_type: field === "status" ? "status_changed" : "updated",
              field_name: field,
              old_value: oldValue ? String(oldValue) : null,
              new_value: newValue ? String(newValue) : null,
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
      queryClient.invalidateQueries({ queryKey: ["projeto"] });
      toast({
        title: "Projeto atualizado",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProjetoDescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, description }: { id: string; description: string }): Promise<void> => {
      const { error } = await supabase
        .from("projetos")
        .update({ additional_info: description })
        .eq("project_id", id);

      if (error) throw error;

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("projeto_activities").insert({
          projeto_id: id,
          user_id: user.id,
          action_type: "description_updated",
          field_name: "additional_info",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
      queryClient.invalidateQueries({ queryKey: ["projeto"] });
    },
  });
}

export function useDeleteProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("projetos")
        .delete()
        .eq("project_id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
      toast({
        title: "Projeto excluído",
        description: "O projeto foi removido.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
