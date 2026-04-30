/**
 * @file: CustomBoardChecklistSubitemsList.tsx
 * @responsibility: CRUD + sortable list for checklist subitems inside a card (custom board)
 * @exports: CustomBoardChecklistSubitemsList
 */

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Pencil, Check, X, GripVertical } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ChecklistSubitem } from "@/hooks/useCustomBoardCards";

interface CustomBoardChecklistSubitemsListProps {
  /** Lista atual de subitens do checklist */
  subitems: ChecklistSubitem[];
  /** Callback chamado sempre que a lista muda (add, toggle, delete, reorder) */
  onChangeSubitems: (subitems: ChecklistSubitem[]) => void;
  /** Se true, desabilita o toggle dos subitens (card pai já concluído) */
  isParentCompleted: boolean;
  /** Se true, abre e foca o input de adicionar subitem automaticamente */
  autoFocusNewSubitem?: boolean;
  /** Chamado após o autofocus ser aplicado, para resetar a flag no pai */
  onAutoFocusDone?: () => void;
}

function SortableSubitemRow({
  item,
  isParentCompleted,
  editingId,
  editingText,
  setEditingText,
  onToggle,
  onDelete,
  startEdit,
  handleSaveEdit,
  handleCancelEdit,
}: {
  item: ChecklistSubitem;
  isParentCompleted: boolean;
  editingId: string | null;
  editingText: string;
  setEditingText: (v: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  startEdit: (item: ChecklistSubitem) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedAtLabel =
    item.completed && item.completed_at
      ? (() => {
          try {
            return format(parseISO(item.completed_at), "dd/MM HH:mm", { locale: ptBR });
          } catch {
            return null;
          }
        })()
      : null;

  const handle = (
    <div
      {...attributes}
      {...listeners}
      className="shrink-0 cursor-grab active:cursor-grabbing touch-none p-0.5 rounded text-zinc-500 hover:text-zinc-300"
      title="Arrastar para reordenar"
    >
      <GripVertical className="h-3.5 w-3.5" />
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 group py-1.5 px-2 rounded-md transition-colors hover:bg-zinc-800/50",
        item.completed && "opacity-60",
        isDragging && "opacity-50 z-10"
      )}
    >
      {handle}
      {editingId === item.id ? (
        <>
          <Input
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            className="flex-1 h-7 text-sm bg-zinc-800 border-zinc-700 text-zinc-100"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit();
              if (e.key === "Escape") handleCancelEdit();
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-emerald-500 hover:bg-emerald-500/10"
            onClick={handleSaveEdit}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:bg-destructive/10"
            onClick={handleCancelEdit}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </>
      ) : (
        <>
          <Checkbox
            checked={item.completed}
            onCheckedChange={() => onToggle(item.id)}
            className="h-4 w-4 shrink-0"
            disabled={isParentCompleted}
          />
          <span
            className={cn(
              "flex-1 text-sm cursor-pointer text-zinc-200 min-w-0",
              item.completed && "line-through text-zinc-500"
            )}
            onDoubleClick={() => startEdit(item)}
          >
            {item.text}
          </span>
          {completedAtLabel && (
            <span className="text-[11px] text-zinc-500 shrink-0">{completedAtLabel}</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => startEdit(item)}
            title="Editar"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            onClick={() => onDelete(item.id)}
            title="Excluir"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  );
}

export function CustomBoardChecklistSubitemsList({
  subitems,
  onChangeSubitems,
  isParentCompleted,
  autoFocusNewSubitem = false,
  onAutoFocusDone,
}: CustomBoardChecklistSubitemsListProps) {
  const [newSubitem, setNewSubitem] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const addSubitemInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (autoFocusNewSubitem) {
      setShowAddInput(true);
      onAutoFocusDone?.();
    }
  }, [autoFocusNewSubitem, onAutoFocusDone]);

  useEffect(() => {
    if (showAddInput && addSubitemInputRef.current) {
      addSubitemInputRef.current.focus();
    }
  }, [showAddInput]);

  const handleAddSubitem = () => {
    if (!newSubitem.trim()) return;
    onChangeSubitems([
      ...subitems,
      { id: crypto.randomUUID(), text: newSubitem.trim(), completed: false },
    ]);
    setNewSubitem("");
  };

  const handleCloseAddInput = () => {
    setShowAddInput(false);
    setNewSubitem("");
  };

  const handleToggle = (id: string) => {
    onChangeSubitems(
      subitems.map((s) =>
        s.id === id
          ? {
              ...s,
              completed: !s.completed,
              completed_at: !s.completed ? new Date().toISOString() : null,
            }
          : s
      )
    );
  };

  const handleDelete = (id: string) => {
    onChangeSubitems(subitems.filter((s) => s.id !== id));
  };

  const startEdit = (item: ChecklistSubitem) => {
    setEditingId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingText.trim()) {
      setEditingId(null);
      return;
    }
    onChangeSubitems(
      subitems.map((s) => (s.id === editingId ? { ...s, text: editingText.trim() } : s))
    );
    setEditingId(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = subitems.findIndex((s) => s.id === active.id);
    const newIndex = subitems.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChangeSubitems(arrayMove(subitems, oldIndex, newIndex));
  };

  return (
    <div className="ml-6 mt-2 space-y-1 border-l-2 border-zinc-800 pl-3">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={subitems.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {subitems.map((item) => (
            <SortableSubitemRow
              key={item.id}
              item={item}
              isParentCompleted={isParentCompleted}
              editingId={editingId}
              editingText={editingText}
              setEditingText={setEditingText}
              onToggle={handleToggle}
              onDelete={handleDelete}
              startEdit={startEdit}
              handleSaveEdit={handleSaveEdit}
              handleCancelEdit={handleCancelEdit}
            />
          ))}
        </SortableContext>
      </DndContext>

      {showAddInput ? (
        <div className="flex items-center gap-2 pt-1">
          <Input
            ref={addSubitemInputRef}
            value={newSubitem}
            onChange={(e) => setNewSubitem(e.target.value)}
            placeholder="Adicionar subitem..."
            className="flex-1 h-7 text-sm bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubitem();
              if (e.key === "Escape") handleCloseAddInput();
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddSubitem}
            disabled={!newSubitem.trim()}
            className="h-7 px-2 text-[#CBC5EA] hover:bg-[#3F1757]/10"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCloseAddInput}
            className="h-7 px-2 text-zinc-400"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddInput(true)}
          className="mt-1 py-1.5 px-2 text-sm text-[#CBC5EA] hover:text-[#ddd8f3] hover:bg-[#3F1757]/10 rounded-md transition-colors w-full text-left"
        >
          + Adicionar subitem
        </button>
      )}
    </div>
  );
}
