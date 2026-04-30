import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Pencil, Check, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  useChecklistSubitems,
  useAddChecklistSubitem,
  useToggleChecklistSubitem,
  useUpdateChecklistSubitem,
  useDeleteChecklistSubitem,
  ChecklistSubitem,
} from "@/hooks/useChecklistSubitems";

interface ChecklistSubitemsListProps {
  checklistItemId: string;
  isParentCompleted: boolean;
  autoFocusNewSubitem?: boolean;
  onAutoFocusDone?: () => void;
}

export function ChecklistSubitemsList({
  checklistItemId,
  isParentCompleted,
  autoFocusNewSubitem = false,
  onAutoFocusDone,
}: ChecklistSubitemsListProps) {
  const [newSubitem, setNewSubitem] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const addSubitemInputRef = useRef<HTMLInputElement>(null);

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

  const { data: subitems = [] } = useChecklistSubitems(checklistItemId);
  const addSubitem = useAddChecklistSubitem();
  const toggleSubitem = useToggleChecklistSubitem();
  const updateSubitem = useUpdateChecklistSubitem();
  const deleteSubitem = useDeleteChecklistSubitem();

  const handleAddSubitem = () => {
    if (!newSubitem.trim()) return;
    addSubitem.mutate({
      checklist_item_id: checklistItemId,
      texto: newSubitem.trim(),
    });
    setNewSubitem("");
  };

  const handleCloseAddInput = () => {
    setShowAddInput(false);
    setNewSubitem("");
  };

  const startEdit = (item: ChecklistSubitem) => {
    setEditingId(item.id);
    setEditingText(item.texto);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingText.trim()) {
      setEditingId(null);
      return;
    }
    updateSubitem.mutate({
      id: editingId,
      texto: editingText.trim(),
      checklistItemId,
    });
    setEditingId(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const formatCompletedAt = (completedAt: string | null | undefined): string | null => {
    if (!completedAt) return null;
    try {
      return format(parseISO(completedAt), "dd/MM HH:mm", { locale: ptBR });
    } catch {
      return null;
    }
  };

  return (
    <div className="ml-10 mt-2 space-y-1 border-l-2 border-zinc-800/60 pl-4">
      {subitems.map((item) => {
        const completedAtLabel = item.concluido ? formatCompletedAt(item.completed_at) : null;
        return (
          <div key={item.id}>
            <div
              className={cn(
                "flex items-start gap-2 group py-1.5 px-2 rounded-md transition-colors hover:bg-zinc-800/50",
                item.concluido && "opacity-60"
              )}
            >
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
                    className="h-6 w-6 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 mt-[2px]"
                    onClick={handleSaveEdit}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-zinc-400 hover:text-destructive hover:bg-destructive/10 mt-[2px]"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <Checkbox
                    checked={item.concluido}
                    onCheckedChange={(checked) =>
                      toggleSubitem.mutate({
                        id: item.id,
                        concluido: !!checked,
                        checklistItemId,
                      })
                    }
                    className="h-4 w-4 shrink-0 transition-colors duration-200 mt-[2px]"
                  />
                  <div className="flex-1 flex flex-col min-w-0">
                    <span
                      className={cn(
                        "text-sm cursor-pointer text-zinc-200 break-words leading-relaxed",
                        item.concluido && "line-through text-zinc-500"
                      )}
                      onDoubleClick={() => startEdit(item)}
                    >
                      {item.texto}
                    </span>
                    {completedAtLabel && (
                      <span className="text-[10px] text-zinc-500 self-start">{completedAtLabel}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-[#CBC5EA] hover:bg-[#3F1757]/10 mt-[2px]"
                    onClick={() => startEdit(item)}
                    title="Editar"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-destructive hover:bg-destructive/10 mt-[2px]"
                    onClick={() =>
                      deleteSubitem.mutate({ id: item.id, checklistItemId })
                    }
                    title="Excluir"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* CTA or Add subitem input */}
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
            className="h-7 px-2 text-[#CBC5EA] hover:text-[#ddd8f3] hover:bg-[#3F1757]/10"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCloseAddInput}
            className="h-7 px-2 text-zinc-400 hover:text-zinc-300"
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
