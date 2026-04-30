import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layers, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useSubtarefas,
  useSubtarefasCount,
  useCreateSubtarefa,
  useToggleSubtarefaStatus,
} from "@/hooks/useSubtarefas";

interface TaskSubtasksSectionProps {
  tarefaId: string;
  projetoId: string;
}

export function TaskSubtasksSection({ tarefaId, projetoId }: TaskSubtasksSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [newSubtask, setNewSubtask] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { data: subtarefas, isLoading } = useSubtarefas(tarefaId);
  const { data: count } = useSubtarefasCount(tarefaId);
  const createSubtarefa = useCreateSubtarefa();
  const toggleStatus = useToggleSubtarefaStatus();

  const handleCreate = () => {
    if (!newSubtask.trim()) return;
    createSubtarefa.mutate({
      parent_id: tarefaId,
      projeto_id: projetoId,
      titulo: newSubtask.trim(),
    });
    setNewSubtask("");
    setIsAdding(false);
  };

  const progress = count && count.total > 0 
    ? Math.round((count.completed / count.total) * 100) 
    : 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-3">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Subtarefas</h3>
                  {count && count.total > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {count.completed}/{count.total}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {count && count.total > 0 && (
                <span className="text-xs font-medium text-muted-foreground">
                  {progress}%
                </span>
              )}
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-3">
          {/* Progress bar */}
          {count && count.total > 0 && (
            <Progress value={progress} className="h-1.5" />
          )}

          {/* Subtasks list */}
          {isLoading ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Carregando...
            </div>
          ) : subtarefas && subtarefas.length > 0 ? (
            <div className="space-y-1">
              {subtarefas.map((sub) => (
                <div
                  key={sub.id}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg border bg-card/50 transition-all hover:bg-muted/50",
                    sub.status === "concluido" && "opacity-60"
                  )}
                >
                  <Checkbox
                    checked={sub.status === "concluido"}
                    onCheckedChange={() =>
                      toggleStatus.mutate({
                        id: sub.id,
                        parentId: tarefaId,
                        projetoId,
                        currentStatus: sub.status,
                      })
                    }
                    className="h-4 w-4 rounded-full"
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      sub.status === "concluido" && "line-through text-muted-foreground"
                    )}
                  >
                    {sub.titulo}
                  </span>
                </div>
              ))}
            </div>
          ) : !isAdding ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Nenhuma subtarefa criada.
            </div>
          ) : null}

          {/* Add subtask input */}
          {isAdding ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nome da subtarefa..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setIsAdding(false);
                    setNewSubtask("");
                  }
                }}
                className="h-9 text-sm"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newSubtask.trim() || createSubtarefa.isPending}
              >
                Criar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewSubtask("");
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar subtarefa
            </Button>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
