import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Plus,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChecklistSubitemsList } from "./ChecklistSubitemsList";
import { useChecklistSubitems } from "@/hooks/useChecklistSubitems";
import {
  useDeleteChecklistItem,
  useUpdateChecklistItem,
  useDuplicateChecklistItem,
  useAddChecklistItem,
  useApplyTemplateToChecklist,
} from "@/hooks/useProjetoTarefas";
import { useTaskTemplates } from "@/hooks/useTaskTemplates";
import { FileText, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";

interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
  completed_at?: string | null;
}

interface TaskChecklistSectionProps {
  tarefaId: string;
  projetoId: string;
  items: ChecklistItem[];
  onToggle: (id: string, checked: boolean) => void;
  onReorder?: (orderedIds: string[]) => void;
}

// Linear progress bar for checklist header
function ChecklistProgressBar({ completed, total }: { completed: number; total: number }) {
  const progressPct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-zinc-400 whitespace-nowrap">
        {completed}/{total} concluído
      </span>
    </div>
  );
}

// Item pai: apenas toggle + texto + ações
function ChecklistItemRow({
  item,
  onToggle,
  isExpanded,
  onExpand,
  onToggleExpand,
  onRename,
  onDuplicate,
  onDelete,
  dragHandle,
}: {
  item: ChecklistItem;
  onToggle: (id: string, checked: boolean) => void;
  isExpanded: boolean;
  onExpand: () => void;
  onToggleExpand: () => void;
  onRename: (id: string, newName: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  dragHandle?: React.ReactNode;
}) {
  const [autoFocusNewSubitem, setAutoFocusNewSubitem] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.texto);
  const editInputRef = useRef<HTMLInputElement>(null);

  const { data: subitems = [] } = useChecklistSubitems(item.id);

  const hasSubitems = subitems.length > 0;
  const completedSubitems = subitems.filter((s) => s.concluido).length;
  const allSubitemsCompleted = hasSubitems ? completedSubitems === subitems.length : true;

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

  const handlePlusClick = () => {
    onExpand();
    setAutoFocusNewSubitem(true);
  };

  const completedAtLabel = (() => {
    if (!item.concluido || !item.completed_at) return null;
    try {
      return format(parseISO(item.completed_at), "dd/MM HH:mm", { locale: ptBR });
    } catch {
      return null;
    }
  })();

  const saveRename = () => {
    if (editValue.trim() && editValue !== item.texto) {
      onRename(item.id, editValue.trim());
    } else {
      setEditValue(item.texto);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveRename();
    if (e.key === "Escape") {
      setEditValue(item.texto);
      setIsEditing(false);
    }
  };

  return (
    <div className="group flex flex-col pt-1">
      <div
        className={cn(
          "flex items-start gap-3 px-2 py-2 rounded-md transition-colors",
          "hover:bg-zinc-900/40",
          item.concluido && !isEditing && "opacity-60"
        )}
      >
        {dragHandle ? (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shrink-0 mt-[2px]">
            {dragHandle}
          </div>
        ) : (
          <div className="w-6 shrink-0" />
        )}

        <Checkbox
          checked={item.concluido}
          onCheckedChange={(checked) => onToggle(item.id, !!checked)}
          className={cn(
            "h-4 w-4 border-zinc-500 rounded-sm shrink-0 transition-opacity mt-[2px]",
            !allSubitemsCompleted && hasSubitems && "opacity-50"
          )}
        />

        <div className="flex-1 flex flex-col min-w-0 gap-1.5">
          {isEditing ? (
            <input
              ref={editInputRef}
              className="flex-1 bg-zinc-900 border border-[#3F1757]/50 rounded px-2 py-0.5 text-[13px] text-zinc-100 outline-none w-full"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveRename}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <span
              className={cn(
                "text-[13px] select-none text-zinc-300 font-normal break-words leading-relaxed",
                item.concluido && "line-through text-zinc-500"
              )}
              onDoubleClick={() => setIsEditing(true)}
            >
              {item.texto}
            </span>
          )}

          {completedAtLabel && !isEditing && (
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
              onClick={handlePlusClick}
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-zinc-900 border-zinc-800">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Renomear
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(item.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(item.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {isExpanded && (
        <ChecklistSubitemsList
          checklistItemId={item.id}
          isParentCompleted={item.concluido}
          autoFocusNewSubitem={autoFocusNewSubitem}
          onAutoFocusDone={() => setAutoFocusNewSubitem(false)}
        />
      )}
    </div>
  );
}

function SortableChecklistItemRow({
  item,
  onToggle,
  isExpanded,
  onExpand,
  onToggleExpand,
  onRename,
  onDuplicate,
  onDelete,
}: {
  item: ChecklistItem;
  onToggle: (id: string, checked: boolean) => void;
  isExpanded: boolean;
  onExpand: () => void;
  onToggleExpand: () => void;
  onRename: (id: string, newName: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
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
      <ChecklistItemRow
        item={item}
        onToggle={onToggle}
        isExpanded={isExpanded}
        onExpand={onExpand}
        onToggleExpand={onToggleExpand}
        onRename={onRename}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        dragHandle={handle}
      />
    </div>
  );
}

export function TaskChecklistSection({
  tarefaId,
  projetoId,
  items,
  onToggle,
  onReorder,
}: TaskChecklistSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const deleteMutation = useDeleteChecklistItem();
  const updateMutation = useUpdateChecklistItem();
  const duplicateMutation = useDuplicateChecklistItem();
  const addMutation = useAddChecklistItem();
  const applyTemplateMutation = useApplyTemplateToChecklist();
  const { data: templates = [], isLoading: templatesLoading } = useTaskTemplates();

  useEffect(() => {
    if (showAddInput) {
      addInputRef.current?.focus();
    }
  }, [showAddInput]);

  const handleAdd = () => {
    if (!newItemText.trim()) return;
    addMutation.mutate(
      { tarefa_id: tarefaId, texto: newItemText.trim(), projetoId },
      {
        onSuccess: () => {
          setNewItemText("");
          addInputRef.current?.focus();
        },
      }
    );
  };

  const handleCancelAdd = () => {
    setNewItemText("");
    setShowAddInput(false);
  };

  const handleRename = (id: string, newName: string) => {
    updateMutation.mutate({ id, texto: newName, tarefaId, projetoId });
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate({ id, tarefaId, projetoId });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id, tarefaId, projetoId });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(items, oldIndex, newIndex);
    onReorder(reordered.map((i) => i.id));
  };

  // Ao clicar fora da seção do checklist, colapsa o item expandido (remove a área "Adicionar subitem")
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
        setExpandedId(null);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const completedCount = items.filter((i) => i.concluido).length;
  const totalCount = items.length;

  const listContent =
    items.length === 0 ? (
      <div className="text-center py-6 text-zinc-500 text-sm">
        Nenhum item no checklist.
      </div>
    ) : onReorder ? (
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {items.map((item) => (
              <SortableChecklistItemRow
                key={item.id}
                item={item}
                onToggle={onToggle}
                isExpanded={expandedId === item.id}
                onExpand={() => setExpandedId(item.id)}
                onToggleExpand={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                onRename={handleRename}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    ) : (
      <div className="space-y-1">
        {items.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            isExpanded={expandedId === item.id}
            onExpand={() => setExpandedId(item.id)}
            onToggleExpand={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
            onRename={handleRename}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );

  return (
    <div ref={sectionRef} className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#3F1757]/10 flex items-center justify-center">
            <CheckSquare className="h-4 w-4 text-[#CBC5EA]" />
          </div>
          <h3 className="font-semibold text-sm text-zinc-100">Checklist</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            onClick={() => setShowAddInput(true)}
            title="Adicionar item"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Template selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 text-xs"
                disabled={templatesLoading || applyTemplateMutation.isPending}
              >
                {applyTemplateMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 bg-zinc-900 border-zinc-800">
              {templatesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                </div>
              ) : templates.length === 0 ? (
                <div className="py-4 px-3 text-center">
                  <FileText className="h-7 w-7 mx-auto mb-2 text-zinc-600" />
                  <p className="text-sm text-zinc-500">Nenhum template</p>
                  <p className="text-xs text-zinc-600 mt-0.5">Crie em Ferramentas → Templates</p>
                </div>
              ) : (
                <>
                  {templates.filter((t) => !t.is_global).length > 0 && (
                    <>
                      <DropdownMenuLabel className="text-xs text-zinc-500">Templates do Projeto</DropdownMenuLabel>
                      {templates.filter((t) => !t.is_global).map((t) => (
                        <DropdownMenuItem
                          key={t.id}
                          className="cursor-pointer"
                          onClick={() => applyTemplateMutation.mutate({ tarefaId, projetoId, templateId: t.id })}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-zinc-200">{t.name}</span>
                            {t.checklists && t.checklists.length > 0 && (
                              <span className="text-xs text-zinc-500">
                                {t.checklists.length} {t.checklists.length === 1 ? "item" : "itens"}
                              </span>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  {templates.filter((t) => !t.is_global).length > 0 && templates.filter((t) => t.is_global).length > 0 && (
                    <DropdownMenuSeparator className="bg-zinc-800" />
                  )}
                  {templates.filter((t) => t.is_global).length > 0 && (
                    <>
                      <DropdownMenuLabel className="text-xs text-zinc-500">Templates Globais</DropdownMenuLabel>
                      {templates.filter((t) => t.is_global).map((t) => (
                        <DropdownMenuItem
                          key={t.id}
                          className="cursor-pointer"
                          onClick={() => applyTemplateMutation.mutate({ tarefaId, projetoId, templateId: t.id })}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-zinc-200">{t.name}</span>
                            {t.checklists && t.checklists.length > 0 && (
                              <span className="text-xs text-zinc-500">
                                {t.checklists.length} {t.checklists.length === 1 ? "item" : "itens"}
                              </span>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {totalCount > 0 && (
            <ChecklistProgressBar completed={completedCount} total={totalCount} />
          )}
        </div>
      </div>

      {listContent}

      {/* Add new item input */}
      {showAddInput && (
        <div className="flex gap-2 items-center mt-2">
          <Input
            ref={addInputRef}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Novo item do checklist..."
            className="flex-1 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") handleCancelAdd();
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 text-emerald-500 hover:text-emerald-400 hover:bg-zinc-800"
            onClick={handleAdd}
            disabled={!newItemText.trim() || addMutation.isPending}
            title="Confirmar"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
            onClick={handleCancelAdd}
            title="Cancelar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Show add button when input is hidden and there are items */}
      {!showAddInput && (
        <button
          type="button"
          onClick={() => setShowAddInput(true)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-[13px] transition-colors mt-1 px-2 py-1 rounded hover:bg-zinc-900/40 w-full"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar item
        </button>
      )}
    </div>
  );
}
