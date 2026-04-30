import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardChartCard } from "@/components/dashboard/DashboardChartCard";
import { DashboardGlassCard } from "@/components/dashboard/DashboardGlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface ClientesGrowthChartProps {
  data: { mes: string; ativos: number; novos: number; churn: number }[];
  isLoading?: boolean;
}

const chartConfig = {
  ativos: {
    label: "Ativos",
    color: "hsl(var(--chart-1))",
  },
  novos: {
    label: "Novos",
    color: "hsl(var(--success))",
  },
  churn: {
    label: "Churn",
    color: "hsl(var(--destructive))",
  },
};

export function ClientesGrowthChart({ data, isLoading }: ClientesGrowthChartProps) {
  if (isLoading) {
    return (
      <DashboardGlassCard className="col-span-3">
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

  return (
    <DashboardChartCard
      className="col-span-3"
      title="Evolução de Clientes"
      description="Crescimento, novos e churn"
      contentClassName="pt-0"
    >
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          />
          <ChartTooltip
            content={<ChartTooltipContent className="border-white/10 bg-background/80 backdrop-blur-sm" />}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="ativos"
            name="Ativos"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="novos"
            name="Novos"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
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
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartContainer>
    </DashboardChartCard>
  );
}
