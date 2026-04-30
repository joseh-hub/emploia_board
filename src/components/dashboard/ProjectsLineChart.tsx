import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardChartCard } from "@/components/dashboard/DashboardChartCard";
import { DashboardGlassCard } from "@/components/dashboard/DashboardGlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface ProjectsLineChartProps {
  data: { name: string; value: number }[];
  isLoading?: boolean;
}

const chartConfig = {
  projetos: {
    label: "Projetos",
    color: "hsl(var(--chart-1))",
  },
};

export function ProjectsLineChart({ data, isLoading }: ProjectsLineChartProps) {
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

  const lineData = data.map((item) => ({
    status: item.name,
    quantidade: item.value,
  }));

  return (
    <DashboardChartCard
      className="col-span-3"
      title="Projetos por Status"
      description="Distribuição atual de projetos"
      contentClassName="pt-0"
    >
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" strokeOpacity={0.6} />
          <XAxis
            dataKey="status"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip
            content={<ChartTooltipContent className="border-white/10 bg-background/80 backdrop-blur-sm" />}
          />
          <Line
            type="monotone"
            dataKey="quantidade"
            name="Projetos"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ChartContainer>
    </DashboardChartCard>
  );
}
