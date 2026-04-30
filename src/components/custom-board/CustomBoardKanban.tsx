import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, closestCorners, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useCustomBoardColumns, useReorderCustomBoardColumns } from "@/hooks/useCustomBoardColumns";
import { useCustomBoardCards, useMoveCustomBoardCard, CustomBoardCard } from "@/hooks/useCustomBoardCards";
import { CustomBoardColumn } from "./CustomBoardColumn";
import { CustomBoardAddColumn } from "./CustomBoardAddColumn";
import { CustomBoardCardOverlay } from "./CustomBoardCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { premiumZinc } from "@/styles/premium-zinc";

interface CustomBoardKanbanProps {
  boardId: string;
  searchQuery?: string;
  filters?: {
    priority?: string[];
    assignedUsers?: string[];
  };
  hideOverdueColumns?: string[];
  onViewCard: (card: CustomBoardCard) => void;
}

export function CustomBoardKanban({
  boardId,
  searchQuery,
  filters,
  hideOverdueColumns = [],
  onViewCard,
}: CustomBoardKanbanProps) {
  const { data: columns, isLoading: columnsLoading } = useCustomBoardColumns(boardId);
  const { data: cards, isLoading: cardsLoading } = useCustomBoardCards(boardId, {
    search: searchQuery,
    priority: filters?.priority,
    assignedUsers: filters?.assignedUsers,
  });
  const moveCard = useMoveCustomBoardCard();
  const reorderColumns = useReorderCustomBoardColumns();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeCard, setActiveCard] = useState<CustomBoardCard | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

    const scrollAmount = 320;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const cardsByColumn = useMemo(() => {
    const grouped: Record<string, CustomBoardCard[]> = {};

    columns?.forEach((col) => {
      grouped[col.id] = [];
    });

    cards?.forEach((card) => {
      if (card.column_id && grouped[card.column_id]) {
        grouped[card.column_id].push(card);
      }
    });

    // Sort by position
    Object.keys(grouped).forEach((colId) => {
      grouped[colId].sort((a, b) => a.position - b.position);
    });

    return grouped;
  }, [cards, columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    
    // Check if it's a column drag
    if (activeId.startsWith("column-")) {
      setActiveColumnId(activeId.replace("column-", ""));
      return;
    }
    
    const card = cards?.find((c) => c.id === activeId);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Visual feedback handled by dnd-kit
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveCard(null);
    setActiveColumnId(null);

    if (!over || !active) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column reorder
    if (activeId.startsWith("column-") && overId.startsWith("column-") && columns) {
      const activeColId = activeId.replace("column-", "");
      const overColId = overId.replace("column-", "");
      
      if (activeColId === overColId) return;
      
      const oldIndex = columns.findIndex((c) => c.id === activeColId);
      const newIndex = columns.findIndex((c) => c.id === overColId);
      
      if (oldIndex === -1 || newIndex === -1) return;
      
      const reordered = arrayMove(columns, oldIndex, newIndex);
      reorderColumns.mutate({
        boardId,
        columns: reordered.map((col, i) => ({ id: col.id, position: i })),
      });
      return;
    }

    // Handle card moves (activeId is card id)
    if (activeId.startsWith("column-")) return;

    const cardId = activeId;

    // Check if dropped over a column (droppable id or sortable column id)
    const resolvedOverId = overId.startsWith("column-") ? overId.replace("column-", "") : overId;
    const targetColumn = columns?.find((col) => col.id === resolvedOverId);
    if (targetColumn) {
      moveCard.mutate({
        cardId,
        boardId,
        columnId: targetColumn.id,
      });
      return;
    }

    // Check if dropped over another card
    const targetCard = cards?.find((c) => c.id === overId);
    if (targetCard && targetCard.column_id) {
      moveCard.mutate({
        cardId,
        boardId,
        columnId: targetCard.column_id,
        position: targetCard.position,
      });
    }
  };

  if (columnsLoading || cardsLoading) {
    return (
      <div className="flex gap-4 overflow-hidden p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-72 h-[500px] flex-shrink-0 rounded-xl bg-zinc-900/50" />
        ))}
      </div>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
            <Inbox className="h-8 w-8 text-zinc-500" />
          </div>
          <h3 className="font-semibold text-lg text-zinc-100">Nenhuma coluna encontrada</h3>
          <p className="text-zinc-500 text-sm max-w-sm">
            Comece adicionando sua primeira coluna para organizar seus cards.
          </p>
          <CustomBoardAddColumn boardId={boardId} />
        </div>
      </div>
    );
  }

  const columnSortableIds = columns.map((c) => `column-${c.id}`);

  return (
    <div className="relative h-full w-full">
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-300 bg-gradient-to-r from-background to-transparent",
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
          "absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-300 bg-gradient-to-l from-background to-transparent",
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={scrollContainerRef}
          className="h-full w-full overflow-x-auto overflow-y-hidden scroll-smooth"
        >
          <div className="flex gap-4 p-1 h-full w-max">
            <SortableContext items={columnSortableIds} strategy={horizontalListSortingStrategy}>
              {columns.map((column) => (
                <CustomBoardColumn
                  key={column.id}
                  column={column}
                  cards={cardsByColumn[column.id] || []}
                  boardId={boardId}
                  hideOverdue={hideOverdueColumns.includes(column.id)}
                  onViewCard={onViewCard}
                />
              ))}
            </SortableContext>

            <CustomBoardAddColumn boardId={boardId} />
          </div>
        </div>

        <DragOverlay>
          {activeCard && <CustomBoardCardOverlay card={activeCard} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
