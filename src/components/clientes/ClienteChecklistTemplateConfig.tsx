import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Pencil, Check, X, Info } from "lucide-react";
import {
  useClienteChecklistTemplate,
  useAddTemplateItem,
  useUpdateTemplateItem,
  useDeleteTemplateItem,
  type ClienteChecklistTemplateItem,
} from "@/hooks/useClienteChecklistTemplate";
import {
  CADENCIAS,
  CATEGORIAS,
  type Cadencia,
  type Categoria,
} from "@/lib/checklistDates";
import { cn } from "@/lib/utils";

interface DraftRow {
  texto: string;
  dias_offset: number;
  cadencia: Cadencia;
  ocorrencias: number;
  categoria: Categoria;
}

const emptyDraft = (): DraftRow => ({
  texto: "",
  dias_offset: 7,
  cadencia: "unica",
  ocorrencias: 1,
  categoria: "reuniao",
});

export function ClienteChecklistTemplateConfig() {
  const { data: items = [] } = useClienteChecklistTemplate();
  const addItem = useAddTemplateItem();
  const updateItem = useUpdateTemplateItem();
  const deleteItem = useDeleteTemplateItem();

  const [draft, setDraft] = useState<DraftRow>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DraftRow>(emptyDraft);

  const handleAdd = () => {
    if (!draft.texto.trim()) return;
    addItem.mutate(
      { ...draft, texto: draft.texto.trim() },
      { onSuccess: () => setDraft(emptyDraft()) }
    );
  };

  const startEdit = (item: ClienteChecklistTemplateItem) => {
    setEditingId(item.id);
    setEditDraft({
      texto: item.texto,
      dias_offset: item.dias_offset ?? 0,
      cadencia: (item.cadencia as Cadencia) || "unica",
      ocorrencias: item.ocorrencias ?? 1,
      categoria: (item.categoria as Categoria) || "outro",
    });
  };

  const handleSave = () => {
    if (!editingId || !editDraft.texto.trim()) {
      setEditingId(null);
      return;
    }
    updateItem.mutate(
      { id: editingId, ...editDraft, texto: editDraft.texto.trim() },
      { onSuccess: () => setEditingId(null) }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-md bg-muted/40 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          Estes itens são aplicados automaticamente a cada novo cliente, com prazo calculado a partir
          da data de início. Mudanças aqui não afetam clientes existentes — use{" "}
          <strong>Aplicar checklist padrão</strong> dentro do card do cliente.
        </span>
      </div>

      {/* Add row */}
      <div className="border rounded-lg p-3 bg-card space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Novo item
          </div>
          <span className="text-[10px] text-muted-foreground">
            {draft.cadencia === "unica"
              ? "Item único — acontece uma vez"
              : `Recorrente — ${draft.ocorrencias}× a cada ${CADENCIAS[draft.cadencia].label.toLowerCase()}`}
          </span>
        </div>
        <div className="grid grid-cols-12 gap-2">
          <Input
            placeholder="Nome do item (ex.: Kickoff, QBR, Reunião Semanal)"
            value={draft.texto}
            onChange={(e) => setDraft({ ...draft, texto: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={cn(
              "h-9 text-sm",
              draft.cadencia === "unica" ? "col-span-12 md:col-span-6" : "col-span-12 md:col-span-4"
            )}
          />
          <Select
            value={draft.categoria}
            onValueChange={(v) => setDraft({ ...draft, categoria: v as Categoria })}
          >
            <SelectTrigger className="col-span-6 md:col-span-2 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CATEGORIAS) as Categoria[]).map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORIAS[c].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min={0}
            value={draft.dias_offset}
            onChange={(e) =>
              setDraft({ ...draft, dias_offset: parseInt(e.target.value) || 0 })
            }
            className="col-span-3 md:col-span-1 h-9 text-sm"
            title={
              draft.cadencia === "unica"
                ? "Dias após entrada do cliente"
                : "Dias até a 1ª ocorrência"
            }
          />
          <Select
            value={draft.cadencia}
            onValueChange={(v) =>
              setDraft({
                ...draft,
                cadencia: v as Cadencia,
                ocorrencias: v === "unica" ? 1 : draft.ocorrencias > 1 ? draft.ocorrencias : 4,
              })
            }
          >
            <SelectTrigger className="col-span-3 md:col-span-2 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CADENCIAS) as Cadencia[]).map((c) => (
                <SelectItem key={c} value={c}>
                  {CADENCIAS[c].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {draft.cadencia !== "unica" && (
            <Input
              type="number"
              min={1}
              value={draft.ocorrencias}
              onChange={(e) =>
                setDraft({ ...draft, ocorrencias: parseInt(e.target.value) || 1 })
              }
              className="col-span-3 md:col-span-2 h-9 text-sm"
              title="Quantas ocorrências gerar"
              placeholder="Qtd"
            />
          )}
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!draft.texto.trim() || addItem.isPending}
            className="col-span-3 md:col-span-1 h-9 gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="text-[10px] text-muted-foreground grid grid-cols-12 gap-2 px-1">
          <span className={draft.cadencia === "unica" ? "col-span-12 md:col-span-6" : "col-span-12 md:col-span-4"}>
            Nome
          </span>
          <span className="col-span-6 md:col-span-2">Categoria</span>
          <span className="col-span-3 md:col-span-1">Dias</span>
          <span className="col-span-3 md:col-span-2">Cadência</span>
          {draft.cadencia !== "unica" && <span className="col-span-3 md:col-span-2">Qtd</span>}
          <span className="col-span-3 md:col-span-1">Add</span>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum item no template ainda. Adicione o primeiro item acima.
        </p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => {
            const cat = CATEGORIAS[(item.categoria as Categoria) || "outro"];
            const Icon = cat.icon;
            const isEditing = editingId === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-lg border bg-card group transition-colors",
                  isEditing ? "border-primary/40" : "hover:border-zinc-700"
                )}
              >
                {isEditing ? (
                  <div className="grid grid-cols-12 gap-2 p-2.5">
                    <Input
                      value={editDraft.texto}
                      onChange={(e) => setEditDraft({ ...editDraft, texto: e.target.value })}
                      className="col-span-12 md:col-span-5 h-9 text-sm"
                      autoFocus
                    />
                    <Select
                      value={editDraft.categoria}
                      onValueChange={(v) =>
                        setEditDraft({ ...editDraft, categoria: v as Categoria })
                      }
                    >
                      <SelectTrigger className="col-span-6 md:col-span-2 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(CATEGORIAS) as Categoria[]).map((c) => (
                          <SelectItem key={c} value={c}>
                            {CATEGORIAS[c].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={0}
                      value={editDraft.dias_offset}
                      onChange={(e) =>
                        setEditDraft({
                          ...editDraft,
                          dias_offset: parseInt(e.target.value) || 0,
                        })
                      }
                      className="col-span-3 md:col-span-1 h-9 text-sm"
                    />
                    <Select
                      value={editDraft.cadencia}
                      onValueChange={(v) =>
                        setEditDraft({
                          ...editDraft,
                          cadencia: v as Cadencia,
                          ocorrencias:
                            v === "unica" ? 1 : editDraft.ocorrencias || 4,
                        })
                      }
                    >
                      <SelectTrigger className="col-span-3 md:col-span-2 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(CADENCIAS) as Cadencia[]).map((c) => (
                          <SelectItem key={c} value={c}>
                            {CADENCIAS[c].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      disabled={editDraft.cadencia === "unica"}
                      value={editDraft.ocorrencias}
                      onChange={(e) =>
                        setEditDraft({
                          ...editDraft,
                          ocorrencias: parseInt(e.target.value) || 1,
                        })
                      }
                      className="col-span-3 md:col-span-1 h-9 text-sm"
                    />
                    <div className="col-span-3 md:col-span-1 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={handleSave}
                      >
                        <Check className="h-4 w-4 text-emerald-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-2.5">
                    <span className="text-xs text-muted-foreground font-mono w-5 text-center shrink-0">
                      {idx + 1}
                    </span>
                    <div
                      className={cn(
                        "h-6 w-6 rounded-md flex items-center justify-center shrink-0",
                        cat.bg,
                        cat.color
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm flex-1 truncate">{item.texto}</span>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium hidden sm:inline-block",
                        cat.bg,
                        cat.color
                      )}
                    >
                      {cat.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                      D+{item.dias_offset ?? 0}
                    </span>
                    <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:inline">
                      {CADENCIAS[(item.cadencia as Cadencia) || "unica"].label}
                      {item.cadencia !== "unica" && ` ×${item.ocorrencias}`}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => startEdit(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-destructive"
                        onClick={() => deleteItem.mutate(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
