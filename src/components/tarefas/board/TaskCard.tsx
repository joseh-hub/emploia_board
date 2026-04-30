import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, GitBranch, Lock } from "lucide-react";
import { Tarefa, useUpdateTarefaStatus, useMoveTarefa, getAssignedUsers } from "@/hooks/useTarefas";
import { useTarefaBoardColumns } from "@/hooks/useTarefaBoardColumns";
import { TaskTagBadges } from "../shared/TaskTagBadges";
import { getUrgencyBadge } from "../shared/TaskPriorityIndicator";
import { TimeEntryModal } from "../modals/TimeEntryModal";
import { useCreateTimeEntry } from "@/hooks/useTimeEntries";
import { useSubtarefasCount } from "@/hooks/useSubtarefas";
import { useCompleteAllChecklistsForTarefa } from "@/hooks/useChecklistSubitems";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useProfiles } from "@/hooks/useProfiles";
import { semanticBadge } from "@/components/shared/BadgeStyles";

interface TaskCardProps {
  tarefa: Tarefa;
  onDoubleClick: () => void;
  hideOverdue?: boolean;
  isBlocked?: boolean;
}

export function TaskCard({ tarefa, onDoubleClick, hideOverdue, isBlocked }: TaskCardProps) {
  const [showTimeModal, setShowTimeModal] = useState(false);
  const updateStatus = useUpdateTarefaStatus();
  const moveTarefa = useMoveTarefa();
  const createTimeEntry = useCreateTimeEntry();
  const completeAllChecklists = useCompleteAllChecklistsForTarefa();
  const { data: profiles = [] } = useProfiles();
  const { data: columns = [] } = useTarefaBoardColumns();

  const doneColumn = columns.find(c => c.is_done_column);

  const completedCount = tarefa.checklists?.filter((c) => c.concluido).length || 0;
  const totalCount = tarefa.checklists?.length || 0;
  const isCompleted = tarefa.status === "concluido";
  const { data: subtarefasCount } = useSubtarefasCount(tarefa.id);

  const rawUrgencyBadge = getUrgencyBadge(tarefa);
  const urgencyBadge = hideOverdue && rawUrgencyBadge?.variant === "destructive"
    ? null
    : rawUrgencyBadge;

  const assignedUsers = getAssignedUsers(tarefa);
  const assignedProfiles = assignedUsers
    .map(userId => profiles.find(p => p.id === userId || p.full_name === userId || p.email === userId))
    .filter(Boolean);

  const formatDate = (date: string) =>
    format(new Date(date), "d MMM", { locale: ptBR });

  const dateLabel = (() => {
    if (!tarefa.start_date && !tarefa.due_date) return null;
    if (tarefa.start_date && tarefa.due_date)
      return `${formatDate(tarefa.start_date)} → ${formatDate(tarefa.due_date)}`;
    if (tarefa.due_date) return formatDate(tarefa.due_date);
    return formatDate(tarefa.start_date!);
  })();

  const handleQuickComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isCompleted) setShowTimeModal(true);
  };

  const handleTimeEntrySaved = (hours: number, minutes: number, description: string, billable: boolean) => {
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes > 0) {
      createTimeEntry.mutate({
        tarefa_id: tarefa.id,
        projeto_id: tarefa.projeto_id,
        duration_minutes: totalMinutes,
        description: description || undefined,
        billable,
      });
    }
    // Marca todos checklists e subitens como concluídos
    if (totalCount > 0) completeAllChecklists.mutate(tarefa.id);
    updateStatus.mutate({ tarefaId: tarefa.id, status: "concluido" });
    if (doneColumn) moveTarefa.mutate({ tarefaId: tarefa.id, columnId: doneColumn.id });
    setShowTimeModal(false);
  };

  const handleTimeEntrySkipped = () => {
    // Marca todos checklists e subitens como concluídos
    if (totalCount > 0) completeAllChecklists.mutate(tarefa.id);
    updateStatus.mutate({ tarefaId: tarefa.id, status: "concluido" });
    if (doneColumn) moveTarefa.mutate({ tarefaId: tarefa.id, columnId: doneColumn.id });
    setShowTimeModal(false);
  };

  return (
    <>
      <Card
        onClick={onDoubleClick}
        className={cn(
          "relative group cursor-pointer border border-zinc-800/50 bg-zinc-900 rounded-xl transition-all duration-200",
          "hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20",
          "active:cursor-grabbing",
          isCompleted && "opacity-60"
        )}
      >
        {/* Botão concluir — aparece no hover */}
        {!isCompleted && (
          <div
            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            data-no-drag="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
              onClick={handleQuickComplete}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        )}

        <CardContent className="p-4 flex flex-col gap-3.5">

          {/* ── Header ── */}
          <div>
            {/* Eyebrow: projeto + lock */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 truncate flex-1">
                {tarefa.projeto?.company_name || "Tarefa"}
              </span>
              {isBlocked && !isCompleted && (
                <Lock className="h-3 w-3 text-red-500 shrink-0" aria-label="Bloqueada por outra tarefa">
                  <title>Bloqueada por outra tarefa</title>
                </Lock>
              )}
            </div>

            {/* Título */}
            <h4 className={cn(
              "text-zinc-100 font-medium text-sm leading-snug line-clamp-2 pr-1",
              isCompleted && "line-through text-zinc-500"
            )}>
              {tarefa.titulo}
            </h4>
          </div>

          {/* ── Info row: data (esq) + subtarefas (dir) ── */}
          {(dateLabel || (subtarefasCount && subtarefasCount.total > 0)) && (
            <div className="flex items-baseline justify-between pt-0.5">
              {dateLabel ? (
                <span className="text-[11px] text-zinc-500 font-medium">{dateLabel}</span>
              ) : (
                <span />
              )}
              {subtarefasCount && subtarefasCount.total > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                  <GitBranch className="h-3 w-3" />
                  <span>{subtarefasCount.completed}/{subtarefasCount.total}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Tags ── */}
          {tarefa.tags && tarefa.tags.length > 0 && (
            <TaskTagBadges tags={tarefa.tags} maxVisible={2} variant="premium" />
          )}

          {/* ── Barra de progresso do checklist (mantida) ── */}
          {totalCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 shrink-0 font-medium">
                {completedCount}/{totalCount}
              </span>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="flex items-end justify-between pt-3 mt-1 border-t border-zinc-800/60 gap-1">
            <div className="flex flex-col gap-2">
              {urgencyBadge && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] px-1.5 h-4 w-fit uppercase tracking-widest",
                    urgencyBadge.variant === "destructive" && semanticBadge.destructive,
                    urgencyBadge.variant === "warning"     && semanticBadge.warning,
                  )}
                >
                  {urgencyBadge.label}
                </Badge>
              )}
              {dateLabel && (
                <span className="text-[10px] font-medium text-zinc-500">
                  {urgencyBadge ? "" : "Prazo: "}{dateLabel}
                </span>
              )}
            </div>

            {/* Avatares */}
            {assignedProfiles.length > 0 ? (
              <div className="flex items-center">
                {assignedProfiles.slice(0, 3).map((profile, index) => {
                  const name = profile?.full_name || profile?.email || "";
                  const initials = name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();
                  return (
                    <Avatar
                      key={profile?.id || index}
                      className={cn("h-6 w-6 border-2 border-zinc-900", index > 0 && "-ml-2")}
                      style={{ zIndex: 10 - index }}
                    >
                      <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-300 font-medium tracking-tighter shadow-inner">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
                {assignedProfiles.length === 1 && (
                  <span className="text-[10px] text-zinc-500 truncate max-w-[70px] ml-1.5 font-medium">
                    {assignedProfiles[0]?.full_name?.split(" ")[0] || assignedProfiles[0]?.email?.split("@")[0]}
                  </span>
                )}
                {assignedProfiles.length > 3 && (
                  <span className="text-[10px] text-zinc-500 ml-1">
                    +{assignedProfiles.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <div className="h-6" />
            )}
          </div>

        </CardContent>
      </Card>

      {showTimeModal && (
        <TimeEntryModal
          open={showTimeModal}
          onOpenChange={setShowTimeModal}
          taskTitle={tarefa.titulo}
          onSave={handleTimeEntrySaved}
          onSkip={handleTimeEntrySkipped}
        />
      )}
    </>
  );
}
