import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown, Star } from "lucide-react";
import { Tarefa, useUpdateTarefaStatus, getAssignedUsers } from "@/hooks/useTarefas";
import { TaskTagBadges } from "../shared/TaskTagBadges";
import { TaskProgressBar } from "../shared/TaskProgressBar";
import { getUrgencyBadge } from "../shared/TaskPriorityIndicator";
import { cn } from "@/lib/utils";
import { useProfiles } from "@/hooks/useProfiles";

type SortColumn = "titulo" | "projeto" | "status" | "due_date" | "progresso";
type SortDirection = "asc" | "desc";

interface TaskTableViewProps {
  tarefas: Tarefa[];
  onTarefaClick: (tarefa: Tarefa) => void;
}

export function TaskTableView({ tarefas, onTarefaClick }: TaskTableViewProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("due_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const updateStatus = useUpdateTarefaStatus();
  const { data: profiles = [] } = useProfiles();

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedTarefas = useMemo(() => {
    const sorted = [...tarefas];
    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "titulo":
          comparison = a.titulo.localeCompare(b.titulo);
          break;
        case "projeto":
          comparison = (a.projeto?.company_name || "").localeCompare(
            b.projeto?.company_name || ""
          );
          break;
        case "status":
          comparison = (a.status || "").localeCompare(b.status || "");
          break;
        case "due_date":
          const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          comparison = dateA - dateB;
          break;
        case "progresso":
          const progressA =
            a.checklists && a.checklists.length > 0
              ? a.checklists.filter((c) => c.concluido).length / a.checklists.length
              : 0;
          const progressB =
            b.checklists && b.checklists.length > 0
              ? b.checklists.filter((c) => c.concluido).length / b.checklists.length
              : 0;
          comparison = progressA - progressB;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [tarefas, sortColumn, sortDirection]);

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "concluido":
        return <Badge variant="success">Concluído</Badge>;
      case "em_progresso":
        return <Badge variant="info">Em Progresso</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const handleStatusToggle = (e: React.MouseEvent, tarefa: Tarefa) => {
    e.stopPropagation();
    updateStatus.mutate({
      tarefaId: tarefa.id,
      status: tarefa.status === "concluido" ? "pendente" : "concluido",
    });
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-12" />
            <TableHead className="w-[35%]">
              <button
                className="flex items-center hover:text-foreground transition-colors font-medium"
                onClick={() => handleSort("titulo")}
              >
                Tarefa
                <SortIcon column="titulo" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-foreground transition-colors font-medium"
                onClick={() => handleSort("projeto")}
              >
                Projeto
                <SortIcon column="projeto" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-foreground transition-colors font-medium"
                onClick={() => handleSort("status")}
              >
                Status
                <SortIcon column="status" />
              </button>
            </TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-foreground transition-colors font-medium"
                onClick={() => handleSort("due_date")}
              >
                Data
                <SortIcon column="due_date" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-foreground transition-colors font-medium"
                onClick={() => handleSort("progresso")}
              >
                Progresso
                <SortIcon column="progresso" />
              </button>
            </TableHead>
            <TableHead>Responsáveis</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTarefas.map((tarefa) => {
            const isCompleted = tarefa.status === "concluido";
            const urgencyBadge = getUrgencyBadge(tarefa);
            
            // Get assigned users (multi-user support)
            const assignedUsers = getAssignedUsers(tarefa);
            const assignedProfiles = assignedUsers
              .map(userId => profiles.find(p => p.id === userId || p.full_name === userId || p.email === userId))
              .filter(Boolean);

            return (
              <TableRow
                key={tarefa.id}
                className={cn(
                  "cursor-pointer group",
                  isCompleted && "opacity-60"
                )}
                onDoubleClick={() => onTarefaClick(tarefa)}
              >
                <TableCell onClick={(e) => handleStatusToggle(e, tarefa)}>
                  <Checkbox
                    checked={isCompleted}
                    className={cn(
                      "h-4.5 w-4.5 rounded-full",
                      isCompleted && "bg-success border-success"
                    )}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {tarefa.priorizado && (
                      <Star className="h-4 w-4 text-warning fill-warning shrink-0" />
                    )}
                    <span
                      className={cn(
                        "font-medium line-clamp-1",
                        isCompleted && "line-through text-muted-foreground"
                      )}
                    >
                      {tarefa.titulo}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {tarefa.projeto?.company_name || "-"}
                </TableCell>
                <TableCell>{getStatusBadge(tarefa.status)}</TableCell>
                <TableCell>
                  <TaskTagBadges tags={tarefa.tags || []} maxVisible={2} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {tarefa.due_date ? (
                      <span className="text-sm">
                        {format(new Date(tarefa.due_date), "dd/MM", {
                          locale: ptBR,
                        })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                    {urgencyBadge && (
                      <Badge
                        variant={urgencyBadge.variant}
                        className="text-xs h-5 px-1.5"
                      >
                        {urgencyBadge.label}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-32">
                  {tarefa.checklists && tarefa.checklists.length > 0 ? (
                    <TaskProgressBar
                      completed={tarefa.checklists.filter((c) => c.concluido).length}
                      total={tarefa.checklists.length}
                    />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
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
                            className={cn("h-6 w-6", index > 0 && "-ml-2")}
                            style={{ zIndex: 10 - index }}
                          >
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {assignedProfiles.length > 3 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          +{assignedProfiles.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
