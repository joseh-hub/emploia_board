import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailyCheckinQuestion {
  id: string;
  text: string;
}

export interface DailyCheckinConfig {
  id: string;
  is_active: boolean;
  questions: DailyCheckinQuestion[];
  created_at: string;
  updated_at: string;
}

export interface DailyCheckinUserConfig {
  id: string;
  user_id: string;
  is_active: boolean;
  schedule_time: string; // "HH:MM:SS"
  selected_columns_projetos: string[];
  selected_columns_tarefas: string[];
  created_at: string;
  updated_at: string;
}

// ── Config global ──────────────────────────────────────────────────────────

export function useDailyCheckinConfig() {
  return useQuery({
    queryKey: ["daily-checkin-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_checkin_config")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        questions: (data.questions as unknown as DailyCheckinQuestion[]) ?? [],
      } as DailyCheckinConfig;
    },
  });
}

export function useUpdateDailyCheckinConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      is_active,
      questions,
    }: {
      id: string;
      is_active?: boolean;
      questions?: DailyCheckinQuestion[];
    }) => {
      const update: Record<string, unknown> = {};
      if (is_active !== undefined) update.is_active = is_active;
      if (questions !== undefined) update.questions = questions;

      const { error } = await supabase
        .from("daily_checkin_config")
        .update(update as never)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-checkin-config"] });
    },
  });
}

// ── Config por usuário ─────────────────────────────────────────────────────

export function useDailyCheckinUserConfigs() {
  return useQuery({
    queryKey: ["daily-checkin-user-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_checkin_user_config")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as DailyCheckinUserConfig[];
    },
  });
}

export function useUpsertDailyCheckinUserConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Omit<DailyCheckinUserConfig, "id" | "created_at" | "updated_at"> & { id?: string }) => {
      const { error } = await supabase
        .from("daily_checkin_user_config")
        .upsert(config as never, { onConflict: "user_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-checkin-user-configs"] });
    },
  });
}

export function useDeleteDailyCheckinUserConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("daily_checkin_user_config")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-checkin-user-configs"] });
    },
  });
}

// ── Telefone no perfil ─────────────────────────────────────────────────────

export function useUpdateProfilePhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, phone }: { userId: string; phone: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ whatsapp_phone: phone } as never)
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
