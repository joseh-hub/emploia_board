import { cn } from "@/lib/utils";

interface CustomBoardDetailSectionSurfaceProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper presentacional para seções do detalhe do card (premium): superfície zinc (bg-zinc-900),
 * borda suave. Apenas "pele" visual, sem lógica.
 */
export function CustomBoardDetailSectionSurface({
  children,
  className,
}: CustomBoardDetailSectionSurfaceProps) {
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
