import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Plus, ChevronDown, ChevronUp, GitBranch, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useSubtarefas,
  useSubtarefasCount,
  useCreateSubtarefa,
  useToggleSubtarefaStatus,
  useDeleteSubtarefa,
} from "@/hooks/useSubtarefas";
import { useTaskDependencies, useRemoveDependency } from "@/hooks/useTaskDependencies";

interface TarefaAdvancedSectionsProps {
  tarefaId: string;
  projetoId: string;
  dueDate?: string | null;
  onDueDateChange?: (date: Date | null) => void;
}

export function TarefaAdvancedSections({
  tarefaId,
  projetoId,
  dueDate,
  onDueDateChange,
}: TarefaAdvancedSectionsProps) {
  return (
    <div className="space-y-4">
      {/* Due Date Section */}
      <DueDateSection dueDate={dueDate} onDueDateChange={onDueDateChange} />
      
      <Separator />
      
      {/* Subtasks Section */}
      <SubtasksSection tarefaId={tarefaId} projetoId={projetoId} />
      
      <Separator />
      
      {/* Dependencies Section */}
      <DependenciesSection tarefaId={tarefaId} />
    </div>
  );
}

function DueDateSection({
  dueDate,
  onDueDateChange,
}: {
  dueDate?: string | null;
  onDueDateChange?: (date: Date | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const parsedDate = dueDate ? new Date(dueDate) : undefined;
  const isOverdue = parsedDate && parsedDate < new Date();
  const isUpcoming = parsedDate && !isOverdue && 
    parsedDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Prazo</span>
      </div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dueDate && "text-muted-foreground",
              isOverdue && "border-destructive text-destructive",
              isUpcoming && "border-warning text-warning"
            )}
          >
            {parsedDate ? (
              <span className="flex items-center gap-2">
                {isOverdue && <Badge variant="destructive" className="text-xs">Atrasado</Badge>}
                {isUpcoming && !isOverdue && <Badge variant="warning" className="text-xs">Hoje</Badge>}
                {format(parsedDate, "PPP", { locale: ptBR })}
              </span>
            ) : (
              "Definir prazo..."
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parsedDate}
            onSelect={(date) => {
              onDueDateChange?.(date || null);
              setIsOpen(false);
            }}
            initialFocus
            className="p-3 pointer-events-auto"
          />
          {dueDate && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => {
                  onDueDateChange?.(null);
                  setIsOpen(false);
                }}
              >
                Remover prazo
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SubtasksSection({
  tarefaId,
  projetoId,
}: {
  tarefaId: string;
  projetoId: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [newSubtask, setNewSubtask] = useState("");
  
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
  };

  const progress = count ? Math.round((count.completed / count.total) * 100) : 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>Subtarefas</span>
            {count && count.total > 0 && (
              <Badge variant="secondary" className="text-xs">
                {count.completed}/{count.total}
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">
        {/* Progress bar */}
        {count && count.total > 0 && (
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Subtasks list */}
        {subtarefas?.map((sub) => (
          <div
            key={sub.id}
            className={cn(
              "flex items-center gap-2 p-2 rounded-md border bg-card",
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

        {/* Add subtask input */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Adicionar subtarefa..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleCreate}
            disabled={!newSubtask.trim() || createSubtarefa.isPending}
            className="h-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DependenciesSection({ tarefaId }: { tarefaId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: dependencies, isLoading } = useTaskDependencies(tarefaId);
  const removeDependency = useRemoveDependency();

  const hasAnyDependencies =
    (dependencies?.blocking?.length || 0) +
    (dependencies?.blockedBy?.length || 0) +
    (dependencies?.relatesTo?.length || 0) > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GitBranch className="h-4 w-4" />
            <span>Dependências</span>
            {hasAnyDependencies && (
              <Badge variant="secondary" className="text-xs">
                {(dependencies?.blocking?.length || 0) +
                  (dependencies?.blockedBy?.length || 0) +
                  (dependencies?.relatesTo?.length || 0)}
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-3">
        {isLoading ? (
          <div className="text-xs text-muted-foreground">Carregando...</div>
        ) : !hasAnyDependencies ? (
          <div className="text-xs text-muted-foreground text-center py-4">
            Nenhuma dependência configurada
          </div>
        ) : (
          <>
            {/* Blocked by */}
            {dependencies?.blockedBy && dependencies.blockedBy.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-destructive">Bloqueado por</div>
                {dependencies.blockedBy.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between p-2 rounded border text-sm"
                  >
                    <span className="truncate">
                      {(dep.depends_on as any)?.titulo || "Tarefa"}
                    </span>
                    <Badge
                      variant={
                        (dep.depends_on as any)?.status === "concluido"
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {(dep.depends_on as any)?.status === "concluido"
                        ? "Concluída"
                        : "Pendente"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Blocking */}
            {dependencies?.blocking && dependencies.blocking.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-warning">Bloqueia</div>
                {dependencies.blocking.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between p-2 rounded border text-sm"
                  >
                    <span className="truncate">
                      {(dep.tarefa as any)?.titulo || "Tarefa"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
