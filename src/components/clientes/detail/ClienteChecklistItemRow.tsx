import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  RotateCcw,
  StickyNote,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  CATEGORIAS,
  STATUS_STYLES,
  getDueLabel,
  getDueStatus,
  type Categoria,
} from "@/lib/checklistDates";
import { cn } from "@/lib/utils";
import {
  ClienteChecklistItem,
  useToggleClienteChecklistItem,
  useUpdateClienteChecklistItem,
  useDeleteClienteChecklistItem,
} from "@/hooks/useClienteChecklist";
import { RegistrarExecucaoPanel } from "./RegistrarExecucaoPanel";

interface Props {
  item: ClienteChecklistItem;
  clienteId: number;
}

export function ClienteChecklistItemRow({ item, clienteId }: Props) {
  const toggle = useToggleClienteChecklistItem();
  const update = useUpdateClienteChecklistItem();
  const remove = useDeleteClienteChecklistItem();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.texto);
  const [showRegister, setShowRegister] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const cat = CATEGORIAS[(item.categoria as Categoria) || "outro"];
  const Icon = cat.icon;
  const status = getDueStatus(item);
  const styles = STATUS_STYLES[status];
  const dueLabel = getDueLabel(item);

  const handleCheck = (checked: boolean) => {
    if (checked && !item.concluido) {
      // Open register panel instead of directly toggling.
      setShowRegister(true);
      return;
    }
    if (!checked && item.concluido) {
      // Reopen
      toggle.mutate({ id: item.id, concluido: false, clienteId });
    }
  };

  const handleConfirmRegister = ({
    nota,
    executado_em,
  }: {
    nota: string;
    executado_em: string;
  }) => {
    if (item.concluido) {
      update.mutate(
        { id: item.id, clienteId, nota, executado_em },
        { onSuccess: () => setEditingNote(false) }
      );
    } else {
      toggle.mutate(
        { id: item.id, concluido: true, clienteId, nota, executado_em },
        { onSuccess: () => setShowRegister(false) }
      );
    }
  };

  const saveTitle = () => {
    const t = titleDraft.trim();
    if (!t || t === item.texto) {
      setEditingTitle(false);
      setTitleDraft(item.texto);
      return;
    }
    update.mutate(
      { id: item.id, clienteId, texto: t },
      { onSuccess: () => setEditingTitle(false) }
    );
  };

  const hasNote = !!item.nota && item.nota.trim().length > 0;

  return (
    <div className="group">
      <div
        className={cn(
          "relative flex items-start gap-2.5 p-2.5 pl-3 rounded-lg border bg-card/50 transition-colors",
          "hover:bg-card hover:border-zinc-700",
          item.concluido && "opacity-70"
        )}
      >
        {/* Status bar */}
        <div
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
          style={{ backgroundColor: styles.bar }}
        />

        <Checkbox
          checked={item.concluido}
          onCheckedChange={(c) => handleCheck(!!c)}
          className="h-4 w-4 mt-1 shrink-0"
        />

        {/* Category icon */}
        <div
          className={cn(
            "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
            cat.bg,
            cat.color
          )}
          title={cat.label}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <Input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") {
                      setEditingTitle(false);
                      setTitleDraft(item.texto);
                    }
                  }}
                  autoFocus
                  className="h-7 text-sm"
                />
              ) : (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.opcional && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 shrink-0">
                      Opcional
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium leading-snug break-words cursor-text",
                      item.concluido && "line-through text-muted-foreground"
                    )}
                    onDoubleClick={() => setEditingTitle(true)}
                  >
                    {item.texto}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span className={cn("font-medium", styles.text)}>{dueLabel}</span>
                {hasNote && (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    {expanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    <StickyNote className="h-3 w-3" />
                    Nota
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {!item.concluido && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px] gap-1"
                  onClick={() => setShowRegister((v) => !v)}
                >
                  Registrar
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuItem onClick={() => setEditingTitle(true)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Renomear
                  </DropdownMenuItem>
                  {item.concluido && (
                    <>
                      <DropdownMenuItem onClick={() => setEditingNote(true)}>
                        <StickyNote className="h-3.5 w-3.5 mr-2" /> Editar nota
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          toggle.mutate({
                            id: item.id,
                            concluido: false,
                            clienteId,
                          })
                        }
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reabrir
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => remove.mutate({ id: item.id, clienteId })}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Expanded note preview */}
          {expanded && hasNote && (
            <div className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap rounded-md bg-muted/40 p-2 border border-border/50">
              {item.nota}
            </div>
          )}
        </div>
      </div>

      {/* Register / edit note panel */}
      {(showRegister || editingNote) && (
        <RegistrarExecucaoPanel
          editing={editingNote}
          initialNote={editingNote ? item.nota : ""}
          initialDate={editingNote ? item.executado_em : null}
          onCancel={() => {
            setShowRegister(false);
            setEditingNote(false);
          }}
          onConfirm={handleConfirmRegister}
          isPending={toggle.isPending || update.isPending}
        />
      )}
    </div>
  );
}
