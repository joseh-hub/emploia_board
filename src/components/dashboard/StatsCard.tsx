import { DashboardGlassCard } from "@/components/dashboard/DashboardGlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    type: "positive" | "negative" | "neutral";
  };
  isLoading?: boolean;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading,
  onClick,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <DashboardGlassCard>
        <div className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <div className="p-5 pt-0">
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      </DashboardGlassCard>
    );
  }

  return (
    <DashboardGlassCard
      onClick={onClick}
      className={cn(onClick && "cursor-pointer hover:ring-1 hover:ring-primary/30")}
    >
      <div className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            "border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5",
            "shadow-sm"
          )}
        >
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="p-5 pt-0">
        <div className="text-2xl font-bold text-foreground tracking-tight">
          {value}
        </div>
        {(trend || description) && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.type === "positive" && "text-success",
                  trend.type === "negative" && "text-destructive",
                  trend.type === "neutral" && "text-muted-foreground"
                )}
              >
                {trend.value}
              </span>
            )}{" "}
            {description}
          </p>
        )}
      </div>
    </DashboardGlassCard>
  );
}
