import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useBoardColumns, useUpdateColumn, useDeleteColumn, useCreateColumn } from "@/hooks/useBoardColumns";
import { Cliente, useMoveCliente } from "@/hooks/useClientes";
import { BoardColumn } from "./BoardColumn";
import { AddColumnButton } from "./AddColumnButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { premiumZinc } from "@/styles/premium-zinc";

interface KanbanBoardProps {
  clientes: Cliente[];
  isLoading?: boolean;
  onViewCliente: (cliente: Cliente) => void;
}

export function KanbanBoard({
  clientes,
  isLoading,
  onViewCliente,
}: KanbanBoardProps) {
  const { data: columns, isLoading: columnsLoading } = useBoardColumns();
  const updateColumn = useUpdateColumn();
  const deleteColumn = useDeleteColumn();
  const createColumn = useCreateColumn();
  const moveCliente = useMoveCliente();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
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
    
    // Also check on resize
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
    
    const scrollAmount = 320; // roughly one column width
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Group clients by column
  const clientesByColumn = useMemo(() => {
    const grouped: Record<string, Cliente[]> = {};
    const unassigned: Cliente[] = [];

    // Initialize columns
    columns?.forEach((col) => {
      grouped[col.id] = [];
    });

    // Distribute clients
    clientes.forEach((cliente) => {
      if (cliente.column_id && grouped[cliente.column_id]) {
        grouped[cliente.column_id].push(cliente);
      } else {
        unassigned.push(cliente);
      }
    });

    // Add unassigned to first column if exists
    if (unassigned.length > 0 && columns?.[0]) {
      grouped[columns[0].id] = [...unassigned, ...(grouped[columns[0].id] || [])];
    }

    return grouped;
  }, [clientes, columns]);

  const handleUpdateColumn = (id: string, data: { name?: string; color?: string }) => {
    updateColumn.mutate({ id, ...data });
  };

  const handleDeleteColumn = (id: string) => {
    deleteColumn.mutate(id);
  };

  const handleMoveCliente = (clienteId: number, columnId: string) => {
    moveCliente.mutate({ clienteId, columnId });
  };

  const handleAddColumn = (name: string) => {
    createColumn.mutate({ name });
  };

  if (columnsLoading || isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-72 h-[500px] flex-shrink-0 rounded-xl bg-zinc-900/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
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

      {/* Scrollable board */}
      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-x-auto overflow-y-hidden scroll-smooth"
      >
        <div className="flex gap-4 p-1 h-full w-max">
          {columns?.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              clientes={clientesByColumn[column.id] || []}
              onUpdateColumn={handleUpdateColumn}
              onDeleteColumn={handleDeleteColumn}
              onMoveCliente={handleMoveCliente}
              onViewCliente={onViewCliente}
            />
          ))}
          
          <AddColumnButton onAdd={handleAddColumn} />
        </div>
      </div>
    </div>
  );
}
