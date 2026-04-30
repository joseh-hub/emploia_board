import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, format, subWeeks, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ClienteStats {
  total: number;
  ativos: number;
  inativos: number;
  recorrentes: number;
  novosNoPeriodo: number;
}

export interface ProjetoStats {
  total: number;
  emAndamento: number;
  vooSolo: number;
  concluidos: number;
  novosNoPeriodo: number;
}

export interface HorasStats {
  totalHoras: number;
  horasPorSemana: { semana: string; horas: number }[];
}

export function useClientesStats(dateFrom?: string) {
  return useQuery({
    queryKey: ["clientes-stats", dateFrom],
    queryFn: async (): Promise<ClienteStats> => {
      const { data, error } = await supabase
        .from("metadata_clientes")
        .select("id, status, Tipo, data_inicio");

      if (error) throw error;

      const total = data?.length || 0;
      const ativos = data?.filter(c => c.status === "ATIVO").length || 0;
      const inativos = total - ativos;
      const recorrentes = data?.filter(c => c.Tipo === "Recorrente").length || 0;

      let novosNoPeriodo = 0;
      if (dateFrom && data) {
        novosNoPeriodo = data.filter(c => {
          if (!c.data_inicio) return false;
          return new Date(c.data_inicio) >= new Date(dateFrom);
        }).length;
      }

      return { total, ativos, inativos, recorrentes, novosNoPeriodo };
    },
  });
}

export function useProjetosStats(dateFrom?: string) {
  return useQuery({
    queryKey: ["projetos-stats", dateFrom],
    queryFn: async (): Promise<ProjetoStats> => {
      const { data, error } = await supabase
        .from("projetos")
        .select("project_id, status, created_at");

      if (error) throw error;

      const total = data?.length || 0;
      const vooSolo = data?.filter(p => p.status === "voo_solo").length || 0;
      const concluidos = data?.filter(p => p.status === "concluido").length || 0;
      const emAndamento = total - vooSolo - concluidos;

      let novosNoPeriodo = 0;
      if (dateFrom && data) {
        novosNoPeriodo = data.filter(p => {
          if (!p.created_at) return false;
          return new Date(p.created_at) >= new Date(dateFrom);
        }).length;
      }

      return { total, emAndamento, vooSolo, concluidos, novosNoPeriodo };
    },
  });
}

export function useHorasStats(dateFrom?: string) {
  return useQuery({
    queryKey: ["horas-stats", dateFrom],
    queryFn: async (): Promise<HorasStats> => {
      const { data: clientes, error: clientesError } = await supabase
        .from("metadata_clientes")
        .select("horas, status");

      if (clientesError) throw clientesError;

      const totalHoras = clientes
        ?.filter(c => c.status === "ATIVO")
        .reduce((acc, c) => acc + (c.horas || 0), 0) || 0;

      const now = new Date();
      const weeksToShow = 8;
      const horasPorSemana: { semana: string; horas: number }[] = [];

      const periodStart = dateFrom || subWeeks(now, weeksToShow).toISOString();
      const { data: tarefas, error: tarefasError } = await supabase
        .from("projeto_tarefas")
        .select("created_at")
        .gte("created_at", periodStart);

      if (!tarefasError && tarefas) {
        for (let i = weeksToShow - 1; i >= 0; i--) {
          const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
          const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });

          const tarefasNaSemana = tarefas.filter(t => {
            const created = new Date(t.created_at);
            return created >= weekStart && created <= weekEnd;
          }).length;

          horasPorSemana.push({
            semana: format(weekStart, "dd/MM", { locale: ptBR }),
            horas: tarefasNaSemana,
          });
        }
      }

      return { totalHoras, horasPorSemana };
    },
  });
}

export function useReceitaStats(dateFrom?: string) {
  return useQuery({
    queryKey: ["receita-stats", dateFrom],
    queryFn: async () => {
      const { data: clientes, error } = await supabase
        .from("metadata_clientes")
        .select("receita, status");

      if (error) throw error;

      const receitaTotal = clientes
        ?.filter(c => c.status === "ATIVO")
        .reduce((acc, c) => acc + (c.receita || 0), 0) || 0;

      return { receitaTotal };
    },
  });
}

export function useReceitaTrend(dateFrom?: string) {
  return useQuery({
    queryKey: ["receita-trend", dateFrom],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gestao_geral")
        .select("mes, ano, mrr_dia_30, receita_esperada_total, nmrr")
        .order("ano", { ascending: true })
        .order("mes", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return [];
      }

      const monthNames = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

      // Determine how many months to show based on the period
      const now = new Date();
      const from = dateFrom ? new Date(dateFrom) : subMonths(now, 6);

      const filtered = data.filter(row => {
        const rowDate = new Date(row.ano, row.mes - 1, 1);
        return rowDate >= from && rowDate <= now;
      });

      // Always show at least the last 6 available entries if filter returns too few
      const toShow = filtered.length >= 2 ? filtered : data.slice(-6);

      return toShow.map(row => ({
        mes: `${monthNames[row.mes]}/${String(row.ano).slice(-2)}`,
        receita: row.mrr_dia_30 || row.receita_esperada_total || row.nmrr || 0,
      }));
    },
  });
}

export function useClientesGrowth(dateFrom?: string) {
  return useQuery({
    queryKey: ["clientes-growth", dateFrom],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gestao_geral")
        .select("mes, ano, clientes_recorrentes, logo_grow, logo_churn, clientes_producao")
        .order("ano", { ascending: true })
        .order("mes", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return [];
      }

      const monthNames = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

      const now = new Date();
      const from = dateFrom ? new Date(dateFrom) : subMonths(now, 6);

      const filtered = data.filter(row => {
        const rowDate = new Date(row.ano, row.mes - 1, 1);
        return rowDate >= from && rowDate <= now;
      });

      const toShow = filtered.length >= 2 ? filtered : data.slice(-6);

      return toShow.map(row => ({
        mes: `${monthNames[row.mes]}/${String(row.ano).slice(-2)}`,
        ativos: (row.clientes_recorrentes || 0) + (row.clientes_producao || 0),
        novos: row.logo_grow || 0,
        churn: row.logo_churn || 0,
      }));
    },
  });
}

export function useStatusDistribution() {
  return useQuery({
    queryKey: ["status-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select("status");

      if (error) throw error;

      const statusCount: Record<string, number> = {};
      data?.forEach(p => {
        const status = p.status || "sem_status";
        statusCount[status] = (statusCount[status] || 0) + 1;
      });

      return Object.entries(statusCount).map(([name, value]) => ({
        name: formatStatusName(name),
        value,
      }));
    },
  });
}

function formatStatusName(status: string): string {
  const statusMap: Record<string, string> = {
    voo_solo: "Voo Solo",
    ativo: "Ativo",
    concluido: "Concluído",
    pausado: "Pausado",
    sem_status: "Sem Status",
  };
  return statusMap[status] || status;
}
