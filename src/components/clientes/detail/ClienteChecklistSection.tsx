import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Trash2, Plus, Pencil, Check, X, ListChecks, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  useClienteChecklist,
  useAddClienteChecklistItem,
  useToggleClienteChecklistItem,
  useUpdateClienteChecklistItem,
  useDeleteClienteChecklistItem,
  useApplyDefaultChecklistToCliente,
  ClienteChecklistItem,
} from "@/hooks/useClienteChecklist";

interface Props {
  clienteId: number;
}

export function ClienteChecklistSection({ clienteId }: Props) {
  const { data: items = [], isLoading } = useClienteChecklist(clienteId);
  const addItem = useAddClienteChecklistItem();
  const toggleItem = useToggleClienteChecklistItem();
  const updateItem = useUpdateClienteChecklistItem();
  const deleteItem = useDeleteClienteChecklistItem();
  const applyDefault = useApplyDefaultChecklistToCliente();

  const [newText, setNewText] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const total = items.length;
  const completed = items.filter((i) => i.concluido).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const handleAdd = () => {
    if (!newText.trim()) return;
    addItem.mutate(
      { cliente_id: clienteId, texto: newText.trim() },
      { onSuccess: () => setNewText("") }
    );
  };

  const startEdit = (item: ClienteChecklistItem) => {
    setEditingId(item.id);
    setEditingText(item.texto);
  };

  const saveEdit = () => {
    if (!editingId || !editingText.trim()) {
      setEditingId(null);
      return;
    }
    updateItem.mutate(
      { id: editingId, texto: editingText.trim(), clienteId },
      { onSuccess: () => { setEditingId(null); setEditingText(""); } }
    );
  };

  const formatDone = (iso: string | null) => {
    if (!iso) return null;
    try {
      return format(parseISO(iso), "dd/MM HH:mm", { locale: ptBR });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Checklist de CS</h4>
          {total > 0 && (
            <span className="text-xs text-muted-foreground">
              {completed}/{total}
            </span>
          )}
        </div>
        {total > 0 && (
          <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
        )}
      </div>

      {total > 0 && <Progress value={progress} className="h-1.5" />}

      {isLoading ? (
        <p className="text-xs text-muted-foreground py-2">Carregando...</p>
      ) : total === 0 ? (
        <div className="flex flex-col items-start gap-2 py-3 px-3 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Sem checklist neste cliente.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              className="gap-1.5 h-8 bg-[#3F1757] hover:bg-[#4d1c6c] text-white"
              onClick={() => applyDefault.mutate(clienteId)}
              disabled={applyDefault.isPending}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Aplicar checklist padrão
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-8"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar item
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((item) => {
            const doneAt = item.concluido ? formatDone(item.completed_at) : null;
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-2 group py-1.5 px-2 rounded-md transition-colors hover:bg-muted/60",
                  item.concluido && "opacity-60"
                )}
              >
                {editingId === item.id ? (
                  <>
                    <Input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-1 h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") { setEditingId(null); setEditingText(""); }
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6 mt-[2px]" onClick={saveEdit}>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mt-[2px]"
                      onClick={() => { setEditingId(null); setEditingText(""); }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Checkbox
                      checked={item.concluido}
                      onCheckedChange={(checked) =>
                        toggleItem.mutate({ id: item.id, concluido: !!checked, clienteId })
                      }
                      className="h-4 w-4 shrink-0 mt-[2px]"
                    />
                    <div className="flex-1 flex flex-col min-w-0">
                      <span
                        className={cn(
                          "text-sm cursor-pointer break-words leading-relaxed",
                          item.concluido && "line-through text-muted-foreground"
                        )}
                        onDoubleClick={() => startEdit(item)}
                      >
                        {item.texto}
                      </span>
                      {doneAt && (
                        <span className="text-[10px] text-muted-foreground self-start">{doneAt}</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity mt-[2px]"
                      onClick={() => startEdit(item)}
                      title="Editar"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive mt-[2px]"
                      onClick={() => deleteItem.mutate({ id: item.id, clienteId })}
                      title="Excluir"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add input */}
      {showAdd || total > 0 ? (
        showAdd ? (
          <div className="flex items-center gap-2 pt-1">
            <Input
              autoFocus
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Adicionar item ao checklist..."
              className="flex-1 h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setShowAdd(false); setNewText(""); }
              }}
            />
            <Button size="sm" variant="ghost" onClick={handleAdd} disabled={!newText.trim()} className="h-8 px-2">
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setShowAdd(false); setNewText(""); }}
              className="h-8 px-2"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="mt-1 py-1.5 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors w-full text-left"
          >
            + Adicionar item
          </button>
        )
      ) : null}
    </div>
  );
}
