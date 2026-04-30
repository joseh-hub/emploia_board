import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { premiumZinc } from "@/styles/premium-zinc";
import { TaskKanbanColumn } from "./TaskKanbanColumn";
import { AddTarefaColumnButton } from "./AddTarefaColumnButton";
import { useTarefaBoardColumns, TarefaBoardColumn } from "@/hooks/useTarefaBoardColumns";
import { Tarefa } from "@/hooks/useTarefas";
import { useBlockedTaskIds } from "@/hooks/useTaskDependencies";

interface TaskKanbanBoardProps {
  tarefas: Tarefa[];
  onTarefaClick: (tarefa: Tarefa) => void;
  hideOverdueColumns?: string[];
}

export function TaskKanbanBoard({ tarefas, onTarefaClick, hideOverdueColumns = [] }: TaskKanbanBoardProps) {
  const { data: columns, isLoading } = useTarefaBoardColumns();
  const { data: blockedTaskIds } = useBlockedTaskIds();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollIndicators = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollIndicators();
    container.addEventListener("scroll", updateScrollIndicators);

    const resizeObserver = new ResizeObserver(updateScrollIndicators);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", updateScrollIndicators);
      resizeObserver.disconnect();
    };
  }, [updateScrollIndicators, columns]);

  const scrollBy = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const getTarefasForColumn = (columnId: string) => {
    return tarefas.filter((t) => t.column_id === columnId);
  };

  const getUnassignedTarefas = () => {
    return tarefas.filter((t) => !t.column_id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-transparent" />
          <span className="text-sm text-zinc-500">Carregando board...</span>
        </div>
      </div>
    );
  }

  const unassignedColumn: TarefaBoardColumn = {
    id: "unassigned",
    name: "Não Atribuído",
    color: "#71717a",
    position: -1,
    is_done_column: false,
    created_at: "",
    updated_at: "",
  };

  const unassignedTarefas = getUnassignedTarefas();

  return (
    <div className="relative h-full w-full">
      {/* Gradiente esquerdo */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-300",
          premiumZinc.scrollGradientLeft,
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full shadow-lg transition-all duration-300",
          premiumZinc.scrollButton,
          canScrollLeft ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
        )}
        onClick={() => scrollBy("left")}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Gradiente direito */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-300",
          premiumZinc.scrollGradientRight,
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full shadow-lg transition-all duration-300",
          premiumZinc.scrollButton,
          canScrollRight ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        )}
        onClick={() => scrollBy("right")}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Container de scroll nativo — igual ao padrão de Projetos/Clientes */}
      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-x-auto overflow-y-hidden scroll-smooth"
      >
        <div className="flex gap-4 p-1 h-full w-max">
          {/* Coluna de não atribuídos */}
          {unassignedTarefas.length > 0 && (
            <TaskKanbanColumn
              column={unassignedColumn}
              tarefas={unassignedTarefas}
              onTarefaClick={onTarefaClick}
              hideOverdue={hideOverdueColumns.includes("unassigned")}
              blockedTaskIds={blockedTaskIds}
            />
          )}

          {/* Colunas regulares */}
          {columns?.map((column) => (
            <TaskKanbanColumn
              key={column.id}
              column={column}
              tarefas={getTarefasForColumn(column.id)}
              onTarefaClick={onTarefaClick}
              hideOverdue={hideOverdueColumns.includes(column.id)}
              blockedTaskIds={blockedTaskIds}
            />
          ))}

          <AddTarefaColumnButton />
        </div>
      </div>
    </div>
  );
}
