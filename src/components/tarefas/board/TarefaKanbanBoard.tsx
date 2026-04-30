import { useRef, useState, useEffect } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TarefaBoardColumn } from "./TarefaBoardColumn";
import { AddTarefaColumnButton } from "./AddTarefaColumnButton";
import { useTarefaBoardColumns, TarefaBoardColumn as TarefaBoardColumnType } from "@/hooks/useTarefaBoardColumns";
import { Tarefa } from "@/hooks/useTarefas";

interface TarefaKanbanBoardProps {
  tarefas: Tarefa[];
  onTarefaClick: (tarefa: Tarefa) => void;
}

export function TarefaKanbanBoard({ tarefas, onTarefaClick }: TarefaKanbanBoardProps) {
  const { data: columns, isLoading } = useTarefaBoardColumns();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, [columns]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 320;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
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
        <div className="animate-pulse text-muted-foreground">Carregando board...</div>
      </div>
    );
  }

  // Create a virtual "Não atribuído" column for tasks without column_id
  const unassignedColumn: TarefaBoardColumnType = {
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
    <div className="relative h-full">
      {/* Left scroll indicator */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none flex items-center justify-start pl-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-md pointer-events-auto"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Right scroll indicator */}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none flex items-center justify-end pr-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-md pointer-events-auto"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ScrollArea className="h-full w-full">
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          className="flex gap-4 p-1 min-h-[400px]"
        >
          {/* Unassigned column if there are tasks without column */}
          {unassignedTarefas.length > 0 && (
            <TarefaBoardColumn
              column={unassignedColumn}
              tarefas={unassignedTarefas}
              onTarefaClick={onTarefaClick}
            />
          )}

          {/* Regular columns */}
          {columns?.map((column) => (
            <TarefaBoardColumn
              key={column.id}
              column={column}
              tarefas={getTarefasForColumn(column.id)}
              onTarefaClick={onTarefaClick}
            />
          ))}

          {/* Add column button */}
          <AddTarefaColumnButton />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
