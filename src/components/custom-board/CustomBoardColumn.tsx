import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CustomBoardColumn as ColumnType, useUpdateCustomBoardColumn, useDeleteCustomBoardColumn, useCustomBoardColumns } from "@/hooks/useCustomBoardColumns";
import { CustomBoardCard as CardType, useCreateCustomBoardCard, useMoveCustomBoardCard } from "@/hooks/useCustomBoardCards";
import { CustomBoardCard } from "./CustomBoardCard";
import { CustomBoardColumnHeader } from "./CustomBoardColumnHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomBoardColumnProps {
  column: ColumnType;
  cards: CardType[];
  boardId: string;
  hideOverdue?: boolean;
  onViewCard: (card: CardType) => void;
}

export function CustomBoardColumn({
  column,
  cards,
  boardId,
  hideOverdue = false,
  onViewCard,
}: CustomBoardColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const updateColumn = useUpdateCustomBoardColumn();
  const deleteColumn = useDeleteCustomBoardColumn();
  const createCard = useCreateCustomBoardCard();
  const moveCard = useMoveCustomBoardCard();
  const { data: columns = [] } = useCustomBoardColumns(boardId);

  // Find the DONE column
  const doneColumn = columns.find(c => c.is_done_column);

  // Column sortable (for reordering columns)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column.id}`,
    data: { type: "column", column },
  });

  // Droppable for cards
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderTopColor: column.color,
  };

  const handleUpdateColumn = (data: { name?: string; color?: string }) => {
    updateColumn.mutate({ id: column.id, boardId, ...data });
  };

  const handleDeleteColumn = () => {
    if (cards.length > 0 || column.is_done_column) {
      return;
    }
    deleteColumn.mutate({ id: column.id, boardId });
  };

  const handleQuickComplete = (card: CardType) => {
    if (doneColumn && card.column_id !== doneColumn.id) {
      moveCard.mutate({
        cardId: card.id,
        boardId,
        columnId: doneColumn.id,
      });
    }
  };

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;

    createCard.mutate({
      boardId,
      columnId: column.id,
      title: newCardTitle.trim(),
    });

    setNewCardTitle("");
    setIsAddingCard(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCard();
    } else if (e.key === "Escape") {
      setIsAddingCard(false);
      setNewCardTitle("");
    }
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={cn(
        "flex flex-col min-w-[300px] max-w-[300px] flex-shrink-0 rounded-xl border border-zinc-800/50 border-t-2 transition-all duration-200",
        "bg-zinc-950/50",
        isOver && "ring-2 ring-[#3F1757]/50 bg-[#3F1757]/5",
        isDragging && "opacity-50 z-50"
      )}
    >
      {/* Header with drag handle */}
      <div className="flex items-center">
        <button
          {...attributes}
          {...listeners}
          className="px-1.5 py-3 cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-colors"
          title="Arrastar para reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <CustomBoardColumnHeader
            column={column}
            cardCount={cards.length}
            onUpdate={handleUpdateColumn}
            onDelete={handleDeleteColumn}
            canDelete={cards.length === 0 && !column.is_done_column}
          />
        </div>
      </div>

      {/* Cards area */}
      <div ref={setDroppableRef} className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-280px)]">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.length > 0 ? (
            cards.map((card) => (
              <CustomBoardCard
                key={card.id}
                card={card}
                onView={() => onViewCard(card)}
                onQuickComplete={doneColumn && card.column_id !== doneColumn.id ? () => handleQuickComplete(card) : undefined}
                hideOverdue={hideOverdue}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-zinc-600 text-sm mb-2">
                Arraste cards aqui
              </p>
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-800" />
            </div>
          )}
        </SortableContext>

        {/* Add card form */}
        {isAddingCard ? (
          <div className="space-y-2">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Título do card..."
              autoFocus
              className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-500"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddCard}
                disabled={!newCardTitle.trim() || createCard.isPending}
              >
                Adicionar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[#CBC5EA] hover:bg-[#3F1757]/10 hover:text-[#ddd8f3]"
            onClick={() => setIsAddingCard(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar card
          </Button>
        )}
      </div>
    </div>
  );
}
