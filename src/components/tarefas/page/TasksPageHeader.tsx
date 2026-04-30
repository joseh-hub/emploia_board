import { LayoutGrid, Table2, Plus, CheckCircle2, Clock, AlertTriangle, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tarefa } from "@/hooks/useTarefas";

interface TasksPageHeaderProps {
  tarefas: Tarefa[];
  viewMode: "board" | "list";
  onViewModeChange: (mode: "board" | "list") => void;
  onNewTask?: () => void;
}

export function TasksPageHeader({
  tarefas,
  viewMode,
  onViewModeChange,
  onNewTask,
}: TasksPageHeaderProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate stats
  const total = tarefas.length;
  const dueToday = tarefas.filter((t) => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  }).length;
  const overdue = tarefas.filter((t) => {
    if (!t.due_date || t.status === "concluido") return false;
    const due = new Date(t.due_date);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  }).length;
  const completed = tarefas.filter((t) => t.status === "concluido").length;

  const stats = [
    {
      label: "Total",
      value: total,
      icon: ListChecks,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Hoje",
      value: dueToday,
      icon: Clock,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Atrasadas",
      value: overdue,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Concluídas",
      value: completed,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Title and Stats */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarefas Priorizadas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Suas tarefas em destaque de todos os projetos
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                stat.bgColor
              )}
            >
              <stat.icon className={cn("h-4 w-4", stat.color)} />
              <span className="text-sm font-medium">{stat.value}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        <div className="flex items-center rounded-lg border bg-muted/50 p-1">
          <Button
            variant={viewMode === "board" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("board")}
            className="gap-1.5 h-8 px-3"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Board</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="gap-1.5 h-8 px-3"
          >
            <Table2 className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Tabela</span>
          </Button>
        </div>

        {/* New Task Button */}
        {onNewTask && (
          <Button onClick={onNewTask} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </Button>
        )}
      </div>
    </div>
  );
}
