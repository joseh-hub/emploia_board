import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tarefa, getAssignedUsers } from "@/hooks/useTarefas";
import { cn } from "@/lib/utils";
import { semanticBadge } from "@/components/shared/BadgeStyles";

interface TarefaBoardCardProps {
  tarefa: Tarefa;
  onDoubleClick: () => void;
}

export function TarefaBoardCard({ tarefa, onDoubleClick }: TarefaBoardCardProps) {
  const completedCount = tarefa.checklists?.filter((c) => c.concluido).length || 0;
  const totalCount = tarefa.checklists?.length || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const assignedUsers = getAssignedUsers(tarefa);

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return format(new Date(date), "d MMM", { locale: ptBR });
  };

  const getStatusBadge = () => {
    switch (tarefa.status) {
      case "concluido":
        return { label: "Concluído", variant: "success" as const };
      case "em_progresso":
        return { label: "Em progresso", variant: "primary" as const };
      default:
        return { label: "Pendente", variant: "muted" as const };
    }
  };

  const statusBadge = getStatusBadge();
  const projectLabel = tarefa.projeto?.company_name || "Tarefa";
  const dueDate = formatDate(tarefa.due_date);
  const startDate = formatDate(tarefa.start_date || tarefa.created_at);

  return (
    <>
      <Card
        draggable={false}
        className={cn(
          "relative group cursor-pointer border border-zinc-800/50 bg-zinc-900 rounded-xl transition-all duration-200",
          "hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20"
        )}
        onClick={onDoubleClick}
      >
        <CardContent className="p-4 flex flex-col gap-3.5 relative">
          <div>
            <span className="mb-1.5 block truncate text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              {projectLabel}
            </span>
            <h4 className="pr-1 text-sm font-medium leading-snug text-zinc-100 line-clamp-2">
              {tarefa.titulo}
            </h4>
          </div>

          <div className="flex items-baseline justify-between gap-3 pt-0.5">
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-200">
              {dueDate ? `Prazo ${dueDate}` : "Sem prazo"}
            </span>
            <span className="shrink-0 text-[11px] font-medium text-zinc-500">
              {totalCount > 0 ? `${totalCount} itens` : "Sem checklist"}
            </span>
          </div>

          {totalCount > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500">
                <span>Conclusão</span>
                <span>{completedCount}/{totalCount}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-zinc-800/80">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    progress === 100 ? "bg-emerald-500" : "bg-[#3F1757]"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-1 flex items-end justify-between gap-1 border-t border-zinc-800/60 pt-3">
            <div className="flex flex-col gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "h-4 w-fit px-1.5 text-[9px] uppercase tracking-widest",
                  semanticBadge[statusBadge.variant]
                )}
              >
                {statusBadge.label}
              </Badge>
              {startDate && (
                <span className="text-[10px] font-medium text-zinc-500">
                  Início: {startDate}
                </span>
              )}
          </div>

            {assignedUsers.length > 0 ? (
              <div className="flex items-center">
                {assignedUsers.slice(0, 3).map((user, index) => {
                  const userInitials = user
                    .split(" ")
                    .slice(0, 2)
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <Avatar
                      key={`${user}-${index}`}
                      className={cn("h-6 w-6 border-2 border-zinc-900", index > 0 && "-ml-2")}
                      style={{ zIndex: 10 - index }}
                    >
                      <AvatarFallback className="bg-zinc-800 text-[9px] font-medium tracking-tighter text-zinc-300 shadow-inner">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
                {assignedUsers.length === 1 && (
                  <span className="ml-1.5 max-w-[70px] truncate text-[10px] font-medium text-zinc-500">
                    {assignedUsers[0].split(" ")[0]}
                  </span>
                )}
              </div>
            ) : (
              <div className="h-6" />
            )}
          </div>
        </CardContent>
      </Card>

    </>
  );
}
