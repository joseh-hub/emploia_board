import * as React from "react";
import { cn } from "@/lib/utils";

interface TaskProgressBarProps {
  completed: number;
  total: number;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const TaskProgressBar = React.forwardRef<HTMLDivElement, TaskProgressBarProps>(
  ({ completed, total, showLabel = true, size = "sm", className }, ref) => {
    if (total === 0) return null;

    const percentage = Math.round((completed / total) * 100);
    const isComplete = completed === total;

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            "flex-1 rounded-full bg-muted overflow-hidden",
            size === "sm" ? "h-1.5" : "h-2"
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              isComplete
                ? "bg-success"
                : "bg-gradient-to-r from-primary to-primary/70"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span
            className={cn(
              "text-muted-foreground font-medium shrink-0",
              size === "sm" ? "text-xs" : "text-sm"
            )}
          >
            {completed}/{total}
          </span>
        )}
      </div>
    );
  }
);

TaskProgressBar.displayName = "TaskProgressBar";

export { TaskProgressBar };
