import { cn } from "@/lib/utils";
import { Tarefa } from "@/hooks/useTarefas";

type UrgencyLevel = "overdue" | "today" | "soon" | "normal";

interface TaskPriorityIndicatorProps {
  tarefa: Tarefa;
  className?: string;
  hideOverdue?: boolean;
}

export function getUrgencyLevel(tarefa: Tarefa): UrgencyLevel {
  if (tarefa.status === "concluido") return "normal";
  if (!tarefa.due_date) return "normal";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(tarefa.due_date);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays <= 2) return "soon";
  return "normal";
}

export function TaskPriorityIndicator({ tarefa, className, hideOverdue }: TaskPriorityIndicatorProps) {
  const urgency = getUrgencyLevel(tarefa);
  
  // If hideOverdue is true and urgency is overdue, don't show the red bar
  const effectiveUrgency = hideOverdue && urgency === "overdue" ? "normal" : urgency;

  return (
    <div
      className={cn(
        "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-colors",
        effectiveUrgency === "overdue" && "bg-destructive",
        effectiveUrgency === "today" && "bg-warning",
        effectiveUrgency === "soon" && "bg-info",
        effectiveUrgency === "normal" && "bg-transparent",
        className
      )}
    />
  );
}

export function getUrgencyBadge(tarefa: Tarefa) {
  const urgency = getUrgencyLevel(tarefa);

  if (urgency === "overdue") {
    return { label: "Atrasada", variant: "destructive" as const };
  }
  if (urgency === "today") {
    return { label: "Hoje", variant: "warning" as const };
  }
  return null;
}
