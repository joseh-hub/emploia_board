import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardChartCard } from "@/components/dashboard/DashboardChartCard";
import { DashboardGlassCard } from "@/components/dashboard/DashboardGlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

interface ReceitaTrendChartProps {
  data: { mes: string; receita: number; meta?: number }[];
  isLoading?: boolean;
}

const chartConfig = {
  receita: {
    label: "Receita",
    color: "hsl(var(--chart-2))",
  },
  meta: {
    label: "Meta",
    color: "hsl(var(--chart-3))",
  },
};

export function ReceitaTrendChart({ data, isLoading }: ReceitaTrendChartProps) {
  if (isLoading) {
    return (
      <DashboardGlassCard className="col-span-4">
        <div className="flex flex-col space-y-1.5 p-5 pb-0">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-5">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </DashboardGlassCard>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value}`;
  };

  return (
    <DashboardChartCard
      className="col-span-4"
      title="Tendência de Receita"
      description="Evolução do MRR nos últimos meses"
      contentClassName="pt-0"
    >
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="receitaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" strokeOpacity={0.6} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
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
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="url(#receitaGradient)"
            dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />
        </AreaChart>
      </ChartContainer>
    </DashboardChartCard>
  );
}
