import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FolderKanban, Clock, DollarSign } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { HorasChart } from "@/components/dashboard/HorasChart";
import { ProjectsLineChart } from "@/components/dashboard/ProjectsLineChart";
import { ReceitaTrendChart } from "@/components/dashboard/ReceitaTrendChart";
import { ClientesGrowthChart } from "@/components/dashboard/ClientesGrowthChart";
import {
  useClientesStats,
  useProjetosStats,
  useHorasStats,
  useReceitaStats,
  useStatusDistribution,
  useReceitaTrend,
  useClientesGrowth,
} from "@/hooks/useDashboardData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { startOfDay, startOfWeek, startOfMonth } from "date-fns";

type Period = "hoje" | "semana" | "mes";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
];

function getDateFrom(period: Period): string {
  const now = new Date();
  switch (period) {
    case "hoje":
      return startOfDay(now).toISOString();
    case "semana":
      return startOfWeek(now, { weekStartsOn: 1 }).toISOString();
    case "mes":
      return startOfMonth(now).toISOString();
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("mes");

  const dateFrom = getDateFrom(period);

  const { data: clientesStats, isLoading: loadingClientes } = useClientesStats(dateFrom);
  const { data: projetosStats, isLoading: loadingProjetos } = useProjetosStats(dateFrom);
  const { data: horasStats, isLoading: loadingHoras } = useHorasStats(dateFrom);
  const { data: receitaStats, isLoading: loadingReceita } = useReceitaStats(dateFrom);
  const { data: statusData, isLoading: loadingStatus } = useStatusDistribution();
  const { data: receitaTrend, isLoading: loadingReceitaTrend } = useReceitaTrend(dateFrom);
  const { data: clientesGrowth, isLoading: loadingClientesGrowth } = useClientesGrowth(dateFrom);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dashboard" />
      <DashboardShell>
        <div className="space-y-6">
          {/* Period Filter */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit">
            {PERIOD_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-3 text-xs rounded-md transition-all",
                  period === opt.value
                    ? "bg-background shadow-sm text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setPeriod(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Clientes Ativos"
              value={clientesStats?.ativos || 0}
              icon={Users}
              trend={{
                value: `${clientesStats?.recorrentes || 0}`,
                type: "positive",
              }}
              description="recorrentes"
              isLoading={loadingClientes}
              onClick={() => navigate("/clientes")}
            />

            <StatsCard
              title="Projetos em Andamento"
              value={projetosStats?.emAndamento || 0}
              icon={FolderKanban}
              trend={{
                value: `${projetosStats?.vooSolo || 0}`,
                type: "neutral",
              }}
              description="em voo solo"
              isLoading={loadingProjetos}
              onClick={() => navigate("/projetos")}
            />

            <StatsCard
              title="Horas Trabalhadas"
              value={`${horasStats?.totalHoras?.toFixed(1) || 0}h`}
              icon={Clock}
              description="total do time"
              isLoading={loadingHoras}
              onClick={() => navigate("/relatorios")}
            />

            <StatsCard
              title="MRR"
              value={formatCurrency(receitaStats?.receitaTotal || 0)}
              icon={DollarSign}
              trend={{
                value: `${clientesStats?.ativos || 0}`,
                type: "positive",
              }}
              description="clientes ativos"
              isLoading={loadingReceita}
              onClick={() => navigate("/relatorios")}
            />
          </div>

          {/* Charts Row 1 - Receita Trend + Horas */}
          <div className="grid gap-4 lg:grid-cols-7">
            <ReceitaTrendChart
              data={receitaTrend || []}
              isLoading={loadingReceitaTrend}
            />

            <ProjectsLineChart
              data={statusData || []}
              isLoading={loadingStatus}
            />
          </div>

          {/* Charts Row 2 - Horas + Clientes Growth */}
          <div className="grid gap-4 lg:grid-cols-7">
            <HorasChart
              data={horasStats?.horasPorSemana || []}
              isLoading={loadingHoras}
            />

            <ClientesGrowthChart
              data={clientesGrowth || []}
              isLoading={loadingClientesGrowth}
            />
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}
