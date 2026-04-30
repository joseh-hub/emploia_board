/**
 * @file: ProjetoDetailSectionSurface.tsx
 * @responsibility: superfície premium reutilizável para seções do modal de projeto (bg-zinc-900, borda zinc)
 * @exports: ProjetoDetailSectionSurface
 * @layer: components
 */

import { cn } from "@/lib/utils";

interface ProjetoDetailSectionSurfaceProps {
  children: React.ReactNode;
  className?: string;
}

export function ProjetoDetailSectionSurface({
  children,
  className,
}: ProjetoDetailSectionSurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800/50",
        "bg-zinc-900",
        "p-4 sm:p-5",
        "transition-colors duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
