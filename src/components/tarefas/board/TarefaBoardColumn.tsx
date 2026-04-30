import { ScrollArea } from "@/components/ui/scroll-area";
import { TarefaBoardCard } from "./TarefaBoardCard";
import { TarefaColumnHeader } from "./TarefaColumnHeader";
import { TarefaBoardColumn as TarefaBoardColumnType } from "@/hooks/useTarefaBoardColumns";
import { Tarefa, useMoveTarefa } from "@/hooks/useTarefas";

interface TarefaBoardColumnProps {
  column: TarefaBoardColumnType;
  tarefas: Tarefa[];
  onTarefaClick: (tarefa: Tarefa) => void;
}

export function TarefaBoardColumn({ column, tarefas, onTarefaClick }: TarefaBoardColumnProps) {
  const moveTarefa = useMoveTarefa();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const tarefaId = e.dataTransfer.getData("tarefaId");
    if (tarefaId) {
      moveTarefa.mutate({ 
        tarefaId, 
        columnId: column.id,
        isDoneColumn: column.is_done_column
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, tarefaId: string) => {
    e.dataTransfer.setData("tarefaId", tarefaId);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="min-w-[300px] max-w-[300px] flex flex-col max-h-[calc(100vh-220px)] bg-muted/30 rounded-xl border border-border/50"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Color bar */}
      <div
        className="h-1.5 rounded-t-xl"
        style={{ backgroundColor: column.color || "#6366f1" }}
      />
      <TarefaColumnHeader column={column} tarefaCount={tarefas.length} placement="top" />
      <div className="p-2 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-1">
            {tarefas.map((tarefa) => (
              <div
                key={tarefa.id}
                draggable
                onDragStart={(e) => {
                  // Don't start drag if clicking on interactive elements
                  const target = e.target as HTMLElement;
                  if (target.closest('[data-no-drag="true"]')) {
                    e.preventDefault();
                    return;
                  }
                  handleDragStart(e, tarefa.id);
                }}
                className="cursor-grab active:cursor-grabbing"
              >
                <TarefaBoardCard
                  tarefa={tarefa}
                  onDoubleClick={() => onTarefaClick(tarefa)}
                />
              </div>
            ))}
            {tarefas.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground text-xs mb-2">
                  Arraste tarefas aqui
                </p>
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30" />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
