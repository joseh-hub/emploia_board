import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardChartCard } from "@/components/dashboard/DashboardChartCard";
import { DashboardGlassCard } from "@/components/dashboard/DashboardGlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface HorasChartProps {
  data: { semana: string; horas: number }[];
  isLoading?: boolean;
}

const chartConfig = {
  horas: {
    label: "Horas",
    color: "hsl(var(--chart-1))",
  },
};

export function HorasChart({ data, isLoading }: HorasChartProps) {
  if (isLoading) {
    return (
      <DashboardGlassCard className="col-span-4">
        <div className="flex flex-col space-y-1.5 p-5 pb-0">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="p-5">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </DashboardGlassCard>
    );
  }

  return (
    <DashboardChartCard
      className="col-span-4"
      title="Horas por Semana"
      description="Últimas 8 semanas de trabalho"
      contentClassName="pt-0"
    >
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="horasBarGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.7} />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" strokeOpacity={0.6} />
          <XAxis
            dataKey="semana"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}h`}
          />
          <ChartTooltip
            content={<ChartTooltipContent className="border-white/10 bg-background/80 backdrop-blur-sm" />}
            cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
          />
          <Bar
            dataKey="horas"
            fill="url(#horasBarGradient)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </DashboardChartCard>
  );
}
