import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Trash2, Pencil, Check, X, GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/hooks/useCustomBoardCards";
import { CustomBoardTemplateSelector, TemplateApplyResult } from "./CustomBoardTemplateSelector";
import { CustomBoardChecklistSubitemsList } from "./CustomBoardChecklistSubitemsList";
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

export type { ChecklistItem } from "@/hooks/useCustomBoardCards";

interface CustomBoardChecklistSectionProps {
  checklist: ChecklistItem[];
  onChange: (checklist: ChecklistItem[]) => void;
  onAllCompleted?: (message: string) => void;
  completionMessage?: string | null;
  onTemplateApplied?: (result: TemplateApplyResult) => void;
}

function SortableChecklistRow({
  item,
  editingId,
  editingText,
  setEditingText,
  onToggle,
  onDelete,
  startEdit,
  handleSaveEdit,
  handleCancelEdit,
  isExpanded,
  onExpand,
  onToggleExpand,
  onSubitemsChange,
  autoFocusNewSubitem,
  onAutoFocusDone,
}: {
  item: ChecklistItem;
  editingId: string | null;
  editingText: string;
  setEditingText: (v: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  startEdit: (item: ChecklistItem) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  isExpanded: boolean;
  onExpand: () => void;
  onToggleExpand: () => void;
  onSubitemsChange: (itemId: string, subitems: ChecklistItem["subitems"]) => void;
  autoFocusNewSubitem: boolean;
  onAutoFocusDone: () => void;
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

  const subitems = item.subitems ?? [];
  const hasSubitems = subitems.length > 0;
  const completedSubitems = subitems.filter((s) => s.completed).length;
  const allSubitemsCompleted = hasSubitems ? completedSubitems === subitems.length : true;

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
      className="shrink-0 cursor-grab active:cursor-grabbing touch-none p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50"
      title="Arrastar para reordenar"
    >
      <GripVertical className="h-4 w-4" />
    </div>
  );

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-50 z-10")}>
      <div className="group flex flex-col pt-1">
        <div
          className={cn(
            "flex items-start gap-3 px-2 py-2 rounded-md transition-colors hover:bg-zinc-900/40",
            item.completed && editingId !== item.id && "opacity-60"
          )}
        >
          {/* Drag handle */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shrink-0 mt-[2px]">
            {handle}
          </div>

          {/* Checkbox */}
          <Checkbox
            checked={item.completed}
            onCheckedChange={() => onToggle(item.id)}
            className={cn(
              "h-4 w-4 border-zinc-500 rounded-sm shrink-0 transition-opacity mt-[2px]",
              !allSubitemsCompleted && hasSubitems && "opacity-50"
            )}
          />

          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0 gap-1.5">
            {editingId === item.id ? (
              <div className="flex items-center gap-1">
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-[#3F1757]/50 rounded px-2 py-0.5 text-[13px] text-zinc-100 outline-none w-full"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                />
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleSaveEdit}>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCancelEdit}>
                  <X className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ) : (
              <span
                className={cn(
                  "text-[13px] select-none text-zinc-300 font-normal break-words leading-relaxed",
                  item.completed && "line-through text-zinc-500"
                )}
                onDoubleClick={() => startEdit(item)}
              >
                {item.text}
              </span>
            )}

            {completedAtLabel && editingId !== item.id && (
              <span className="text-[11px] text-zinc-500 font-mono tracking-tighter self-start bg-zinc-900/50 px-1.5 rounded">
                {completedAtLabel}
              </span>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 shrink-0 mt-[2px]">
            {hasSubitems && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 shrink-0 border-zinc-800 text-zinc-400 font-normal bg-zinc-950 mr-1">
                {completedSubitems}/{subitems.length}
              </Badge>
            )}

            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                onClick={() => {
                  onExpand();
                  // autoFocus subitem handled via state in parent
                }}
                title="Adicionar subitem"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>

              <button
                type="button"
                onClick={onToggleExpand}
                className={cn(
                  "h-6 w-6 flex items-center justify-center shrink-0 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
                  !hasSubitems && "invisible"
                )}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                onClick={() => startEdit(item)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      {isExpanded && (
        <CustomBoardChecklistSubitemsList
          subitems={subitems}
          onChangeSubitems={(newSubitems) => onSubitemsChange(item.id, newSubitems)}
          isParentCompleted={item.completed}
          autoFocusNewSubitem={autoFocusNewSubitem}
          onAutoFocusDone={onAutoFocusDone}
        />
      )}
    </div>
  </div>
  );
}

export function CustomBoardChecklistSection({
  checklist,
  onChange,
  onAllCompleted,
  completionMessage,
  onTemplateApplied,
}: CustomBoardChecklistSectionProps) {
  const [newItemText, setNewItemText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [autoFocusNewSubitem, setAutoFocusNewSubitem] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
        setExpandedId(null);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const completedCount = checklist.filter((item) => item.completed).length;
  const progress = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

  const handleAdd = () => {
    if (!newItemText.trim()) return;
    onChange([
      ...checklist,
      { id: crypto.randomUUID(), text: newItemText.trim(), completed: false, subitems: [] },
    ]);
    setNewItemText("");
  };

  const handleSubitemsChange = (itemId: string, subitems: ChecklistItem["subitems"]) => {
    onChange(
      checklist.map((i) =>
        i.id === itemId ? { ...i, subitems: subitems ?? [] } : i
      )
    );
  };

  const handleToggle = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id
        ? {
            ...item,
            completed: !item.completed,
            completed_at: !item.completed ? new Date().toISOString() : null,
          }
        : item
    );
    onChange(updated);

    // Detect all completed when toggling an item to completed
    const toggled = updated.find((item) => item.id === id);
    if (
      toggled?.completed &&
      updated.length > 0 &&
      updated.every((item) => item.completed) &&
      completionMessage &&
      onAllCompleted
    ) {
      onAllCompleted(completionMessage);
    }
  };

  const handleDelete = (id: string) => {
    onChange(checklist.filter((item) => item.id !== id));
  };

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingText.trim()) {
      setEditingId(null);
      return;
    }
    onChange(
      checklist.map((item) =>
        item.id === editingId ? { ...item, text: editingText.trim() } : item
      )
    );
    setEditingId(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleApplyTemplate = (result: TemplateApplyResult) => {
    const normalized = result.items.map((i) => ({
      ...i,
      subitems: i.subitems ?? [],
    }));
    onChange([...checklist, ...normalized]);
    if (onTemplateApplied) {
      onTemplateApplied(result);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = checklist.findIndex((i) => i.id === active.id);
    const newIndex = checklist.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(checklist, oldIndex, newIndex));
  };

  return (
    <div ref={sectionRef} className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#3F1757]/10 flex items-center justify-center">
            <CheckSquare className="h-4 w-4 text-[#CBC5EA]" />
          </div>
          <h3 className="font-semibold text-sm text-zinc-100">Checklist</h3>
        </div>
        <div className="flex items-center gap-3">
          <CustomBoardTemplateSelector onApply={handleApplyTemplate} />
          {checklist.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-zinc-400 whitespace-nowrap">
                {completedCount}/{checklist.length} concluído
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={checklist.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {checklist.map((item) => (
              <SortableChecklistRow
                key={item.id}
                item={item}
                editingId={editingId}
                editingText={editingText}
                setEditingText={setEditingText}
                onToggle={handleToggle}
                onDelete={handleDelete}
                startEdit={startEdit}
                handleSaveEdit={handleSaveEdit}
                handleCancelEdit={handleCancelEdit}
                isExpanded={expandedId === item.id}
                onExpand={() => {
                  setExpandedId(item.id);
                  setAutoFocusNewSubitem(true);
                }}
                onToggleExpand={() =>
                  setExpandedId((prev) => (prev === item.id ? null : item.id))
                }
                onSubitemsChange={handleSubitemsChange}
                autoFocusNewSubitem={expandedId === item.id && autoFocusNewSubitem}
                onAutoFocusDone={() => setAutoFocusNewSubitem(false)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add new item */}
      <div className="flex gap-2">
        <Input
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Adicionar item..."
          className="flex-1 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newItemText.trim()}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
