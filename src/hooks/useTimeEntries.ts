import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface TimeEntry {
  id: string;
  user_id: string;
  tarefa_id: string | null;
  projeto_id: string | null;
  cliente_id: number | null;
  description: string | null;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  billable: boolean;
  created_at: string;
}

export interface CreateTimeEntryInput {
  tarefa_id?: string;
  projeto_id?: string;
  cliente_id?: number;
  duration_minutes: number;
  description?: string;
  billable?: boolean;
}

// Fetch client_id from project
async function getClientIdFromProject(projetoId: string): Promise<number | null> {
  const { data } = await supabase
    .from("projetos")
    .select("id_cliente")
    .eq("project_id", projetoId)
    .single();
  
  return data?.id_cliente ?? null;
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTimeEntryInput) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      // If we have projeto_id but no cliente_id, fetch it
      let clienteId = data.cliente_id;
      if (!clienteId && data.projeto_id) {
        clienteId = await getClientIdFromProject(data.projeto_id) ?? undefined;
      }

      const { error } = await supabase.from("time_entries").insert({
        user_id: userData.user.id,
        tarefa_id: data.tarefa_id || null,
        projeto_id: data.projeto_id || null,
        cliente_id: clienteId || null,
        duration_minutes: data.duration_minutes,
        description: data.description || null,
        billable: data.billable ?? true,
        start_time: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast({ title: "Horas registradas com sucesso!" });
    },
    onError: (error) => {
      console.error("Error creating time entry:", error);
      toast({ 
        title: "Erro ao registrar horas", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });
}

export function useTimeEntriesByTask(tarefaId: string | undefined) {
  return useQuery({
    queryKey: ["time-entries", "task", tarefaId],
    queryFn: async () => {
      if (!tarefaId) return [];
      
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("tarefa_id", tarefaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TimeEntry[];
    },
    enabled: !!tarefaId,
  });
}

export function useTimeEntriesByProject(projetoId: string | undefined) {
  return useQuery({
    queryKey: ["time-entries", "project", projetoId],
    queryFn: async () => {
      if (!projetoId) return [];
      
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("projeto_id", projetoId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TimeEntry[];
    },
    enabled: !!projetoId,
  });
}

export function useTimeEntriesByClient(clienteId: number | undefined) {
  return useQuery({
    queryKey: ["time-entries", "client", clienteId],
    queryFn: async () => {
      if (!clienteId) return [];
      
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TimeEntry[];
    },
    enabled: !!clienteId,
  });
}

export function useTimeEntriesByUser(userId: string | undefined) {
  return useQuery({
    queryKey: ["time-entries", "user", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TimeEntry[];
    },
    enabled: !!userId,
  });
}

// Helper to calculate total hours from entries
export function calculateTotalHours(entries: TimeEntry[]): { hours: number; minutes: number } {
  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}
