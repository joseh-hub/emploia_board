/**
 * @file: DashboardChartCard.tsx
 * @responsibility: Dashboard chart container — glass card + title/description + chart slot
 * @exports: DashboardChartCard
 * @imports: DashboardGlassCard, cn
 * @layer: components
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardGlassCard } from "./DashboardGlassCard";

interface DashboardChartCardProps {
  /** Título exibido no topo do card */
  title: string;
  /** Subtítulo descritivo (opcional) */
  description?: string;
  /** Conteúdo do gráfico */
  children: React.ReactNode;
  /** Classes adicionais para o card externo */
  className?: string;
  /** Classes adicionais para o container interno do conteúdo */
  contentClassName?: string;
}

export function DashboardChartCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: DashboardChartCardProps) {
  return (
    <DashboardGlassCard className={cn("flex flex-col", className)}>
      <div className="flex flex-col space-y-1.5 p-5 pb-0">
        <h3 className="text-base font-semibold leading-none tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className={cn("p-5 flex-1 min-h-0", contentClassName)}>{children}</div>
    </DashboardGlassCard>
  );
}
