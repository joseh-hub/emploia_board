/**
 * @file: DashboardGlassCard.tsx
 * @responsibility: Glass-style card wrapper for Dashboard (translucent, blur, subtle border/highlight)
 * @exports: DashboardGlassCard
 * @imports: cn from utils
 * @layer: components
 */

import * as React from "react";
import { cn } from "@/lib/utils";

const DashboardGlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-xl border border-white/10 dark:border-white/5",
      "bg-card/70 dark:bg-card/50 backdrop-blur-md",
      "shadow-lg shadow-black/5 dark:shadow-black/20",
      "transition-all duration-200 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30",
      "hover:-translate-y-0.5",
      "overflow-hidden",
      className
    )}
    {...props}
  >
    {/* Top highlight line */}
    <div
      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      aria-hidden
    />
    {props.children}
  </div>
));
DashboardGlassCard.displayName = "DashboardGlassCard";

export { DashboardGlassCard };
