import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./TaskCard";
import { TarefaColumnHeader } from "./TarefaColumnHeader";
import { TarefaBoardColumn as TarefaBoardColumnType } from "@/hooks/useTarefaBoardColumns";
import { Tarefa, useMoveTarefa } from "@/hooks/useTarefas";
import { useCompleteAllChecklistsForTarefa } from "@/hooks/useChecklistSubitems";

interface TaskKanbanColumnProps {
  column: TarefaBoardColumnType;
  tarefas: Tarefa[];
  onTarefaClick: (tarefa: Tarefa) => void;
  hideOverdue?: boolean;
  blockedTaskIds?: Set<string>;
}

export function TaskKanbanColumn({ column, tarefas, onTarefaClick, hideOverdue, blockedTaskIds }: TaskKanbanColumnProps) {
  const moveTarefa = useMoveTarefa();
  const completeAllChecklists = useCompleteAllChecklistsForTarefa();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const tarefaId = e.dataTransfer.getData("tarefaId");
    if (!tarefaId) return;

    moveTarefa.mutate({ 
      tarefaId, 
      columnId: column.id,
      isDoneColumn: column.is_done_column
    });

    // Se a coluna está marcada nas configurações de board (hideOverdue),
    // marca todos os checklists e subitens do card como concluídos
    if (hideOverdue) {
      completeAllChecklists.mutate(tarefaId);
    }
  };

  const handleDragStart = (e: React.DragEvent, tarefaId: string) => {
    e.dataTransfer.setData("tarefaId", tarefaId);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="min-w-[300px] max-w-[300px] flex-shrink-0 flex flex-col h-[calc(100vh-130px)] bg-zinc-950/50 rounded-xl border border-zinc-800/50 border-t-2 transition-all duration-200"
      style={{ borderTopColor: column.color || "#3F1757" }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <TarefaColumnHeader column={column} tarefaCount={tarefas.length} placement="top" />
      <div className="flex-1 overflow-hidden p-2">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-1">
            {tarefas.map((tarefa) => (
              <div
                key={tarefa.id}
                draggable
                onDragStart={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('[data-no-drag="true"]')) {
                    e.preventDefault();
                    return;
                  }
                  handleDragStart(e, tarefa.id);
                }}
                className="cursor-grab active:cursor-grabbing"
              >
                <TaskCard
                  tarefa={tarefa}
                  onDoubleClick={() => onTarefaClick(tarefa)}
                  hideOverdue={hideOverdue}
                  isBlocked={blockedTaskIds?.has(tarefa.id)}
                />
              </div>
            ))}

            {tarefas.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-zinc-600 text-sm mb-2">
                  Arraste tarefas aqui
                </p>
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-800" />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
