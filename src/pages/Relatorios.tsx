import { useState } from "react";
import {
  Users,
  FolderKanban,
  Clock,
  DollarSign,
  FileDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardChartCard } from "@/components/dashboard/DashboardChartCard";
import { DashboardGlassCard } from "@/components/dashboard/DashboardGlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Relatorios() {
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

  const formatCurrencyShort = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value}`;
  };

  const clienteDistData = [
    { name: "Ativos", value: clientesStats?.ativos || 0 },
    { name: "Inativos", value: clientesStats?.inativos || 0 },
    { name: "Recorrentes", value: clientesStats?.recorrentes || 0 },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Relatórios">
        <Button variant="outline" size="sm" className="gap-2">
          <FileDown className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar CSV</span>
        </Button>
      </TopBar>
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
              title="Total de Clientes"
              value={clientesStats?.total || 0}
              icon={Users}
              trend={{
                value: `${clientesStats?.novosNoPeriodo || 0}`,
                type: "positive",
              }}
              description="novos no período"
              isLoading={loadingClientes}
            />

            <StatsCard
              title="Projetos"
              value={projetosStats?.total || 0}
              icon={FolderKanban}
              trend={{
                value: `${projetosStats?.concluidos || 0}`,
                type: "positive",
              }}
              description="concluídos"
              isLoading={loadingProjetos}
            />

            <StatsCard
              title="Horas Contratadas"
              value={`${horasStats?.totalHoras?.toFixed(0) || 0}h`}
              icon={Clock}
              description="clientes ativos"
              isLoading={loadingHoras}
            />

            <StatsCard
              title="Receita Total (MRR)"
              value={formatCurrency(receitaStats?.receitaTotal || 0)}
              icon={DollarSign}
              trend={{
                value: `${clientesStats?.ativos || 0}`,
                type: "positive",
              }}
              description="clientes ativos"
              isLoading={loadingReceita}
            />
          </div>

          {/* Charts Row 1 - Receita Trend + Clientes Distribution */}
          <div className="grid gap-4 lg:grid-cols-7">
            {/* Receita Trend */}
            {loadingReceitaTrend ? (
              <DashboardGlassCard className="col-span-4">
                <div className="flex flex-col space-y-1.5 p-5 pb-0">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="p-5">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              </DashboardGlassCard>
            ) : (
              <DashboardChartCard
                className="col-span-4"
                title="Evolução da Receita"
                description="Tendência do MRR ao longo dos meses"
                contentClassName="pt-0"
              >
                <ChartContainer
                  config={{
                    receita: { label: "Receita", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px] w-full"
                >
                  <AreaChart data={receitaTrend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="relReceitaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" strokeOpacity={0.6} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={formatCurrencyShort} />
                    <ChartTooltip
                      content={<ChartTooltipContent className="border-white/10 bg-background/80 backdrop-blur-sm" />}
                      formatter={(value: number) => [formatCurrency(value), "Receita"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="receita"
                      name="Receita"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      fill="url(#relReceitaGrad)"
                      dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ChartContainer>
              </DashboardChartCard>
            )}

            {/* Clientes Pie Chart */}
            {loadingClientes ? (
              <DashboardGlassCard className="col-span-3">
                <div className="flex flex-col space-y-1.5 p-5 pb-0">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="p-5">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              </DashboardGlassCard>
            ) : (
              <DashboardChartCard
                className="col-span-3"
                title="Distribuição de Clientes"
                description="Por status e tipo"
                contentClassName="pt-0"
              >
                <ChartContainer
                  config={{
                    value: { label: "Quantidade", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px] w-full"
                >
                  <BarChart data={clienteDistData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" strokeOpacity={0.6} />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={90}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent className="border-white/10 bg-background/80 backdrop-blur-sm" />}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {clienteDistData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </DashboardChartCard>
            )}
          </div>

          {/* Charts Row 2 - Horas + Projetos por Status */}
          <div className="grid gap-4 lg:grid-cols-7">
            {/* Horas por Semana */}
            {loadingHoras ? (
              <DashboardGlassCard className="col-span-4">
                <div className="flex flex-col space-y-1.5 p-5 pb-0">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-52" />
                </div>
                <div className="p-5">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              </DashboardGlassCard>
            ) : (
              <DashboardChartCard
                className="col-span-4"
                title="Atividade por Semana"
                description="Tarefas criadas nas últimas 8 semanas"
                contentClassName="pt-0"
              >
                <ChartContainer
                  config={{
                    horas: { label: "Tarefas", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px] w-full"
                >
                  <BarChart data={horasStats?.horasPorSemana || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="relHorasGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" strokeOpacity={0.6} />
                    <XAxis dataKey="semana" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <ChartTooltip
                      content={<ChartTooltipContent className="border-white/10 bg-background/80 backdrop-blur-sm" />}
                      cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                    />
                    <Bar dataKey="horas" fill="url(#relHorasGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </DashboardChartCard>
            )}

            {/* Projetos por Status */}
            {loadingStatus ? (
              <DashboardGlassCard className="col-span-3">
                <div className="flex flex-col space-y-1.5 p-5 pb-0">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="p-5">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              </DashboardGlassCard>
            ) : (
              <DashboardChartCard
                className="col-span-3"
                title="Projetos por Status"
                description="Distribuição atual de projetos"
                contentClassName="pt-0"
              >
                <ChartContainer
                  config={{
                    value: { label: "Projetos", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px] w-full"
                >
                  <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <ChartTooltip
                      content={<ChartTooltipContent className="border-white/10 bg-background/80 backdrop-blur-sm" />}
                    />
                    <Pie
                      data={statusData || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ strokeWidth: 1 }}
                    >
                      {(statusData || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      wrapperStyle={{ fontSize: 12 }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ChartContainer>
              </DashboardChartCard>
            )}
          </div>

          {/* Charts Row 3 - Clientes Growth */}
          <div className="grid gap-4 lg:grid-cols-7">
            {loadingClientesGrowth ? (
              <DashboardGlassCard className="col-span-4">
                <div className="flex flex-col space-y-1.5 p-5 pb-0">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="p-5">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              </DashboardGlassCard>
            ) : (
              <DashboardChartCard
                className="col-span-4"
                title="Evolução de Clientes"
                description="Crescimento, novos e churn ao longo dos meses"
                contentClassName="pt-0"
              >
                <ChartContainer
                  config={{
                    ativos: { label: "Ativos", color: "hsl(var(--chart-1))" },
                    novos: { label: "Novos", color: "hsl(var(--success))" },
                    churn: { label: "Churn", color: "hsl(var(--destructive))" },
                  }}
                  className="h-[300px] w-full"
                >
                  <LineChart data={clientesGrowth || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" strokeOpacity={0.6} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <ChartTooltip
                      content={<ChartTooltipContent className="border-white/10 bg-background/80 backdrop-blur-sm" />}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                    <Line
                      type="monotone"
                      dataKey="ativos"
                      name="Ativos"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="novos"
                      name="Novos"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="churn"
                      name="Churn"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>
              </DashboardChartCard>
            )}

            {/* Resumo Geral */}
            <DashboardGlassCard className="col-span-3">
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Resumo Geral</h3>
                  <p className="text-xs text-muted-foreground">Métricas consolidadas do período</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">Total de Clientes</span>
                    </div>
                    <span className="text-sm font-semibold">{clientesStats?.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-[#97EAD2]/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-[#97EAD2]" />
                      </div>
                      <span className="text-sm text-muted-foreground">Clientes Ativos</span>
                    </div>
                    <span className="text-sm font-semibold text-[#97EAD2]">{clientesStats?.ativos || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-[#ED6A5A]/10 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-[#ED6A5A]" />
                      </div>
                      <span className="text-sm text-muted-foreground">Horas Contratadas</span>
                    </div>
                    <span className="text-sm font-semibold text-[#ED6A5A]">{horasStats?.totalHoras?.toFixed(0) || 0}h</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-[#CBC5EA]/10 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-[#CBC5EA]" />
                      </div>
                      <span className="text-sm text-muted-foreground">Recorrentes</span>
                    </div>
                    <span className="text-sm font-semibold text-[#CBC5EA]">{clientesStats?.recorrentes || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-[#97EAD2]/10 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-[#97EAD2]" />
                      </div>
                      <span className="text-sm text-muted-foreground">MRR</span>
                    </div>
                    <span className="text-sm font-semibold text-[#97EAD2]">{formatCurrency(receitaStats?.receitaTotal || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-red-500/10 flex items-center justify-center">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">Inativos</span>
                    </div>
                    <span className="text-sm font-semibold text-red-500">{clientesStats?.inativos || 0}</span>
                  </div>
                </div>
              </div>
            </DashboardGlassCard>
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}
