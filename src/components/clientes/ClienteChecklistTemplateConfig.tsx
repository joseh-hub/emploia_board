import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Check, X, Info } from "lucide-react";
import {
  useClienteChecklistTemplate,
  useAddTemplateItem,
  useUpdateTemplateItem,
  useDeleteTemplateItem,
} from "@/hooks/useClienteChecklistTemplate";

export function ClienteChecklistTemplateConfig() {
  const { data: items = [] } = useClienteChecklistTemplate();
  const addItem = useAddTemplateItem();
  const updateItem = useUpdateTemplateItem();
  const deleteItem = useDeleteTemplateItem();

  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const handleAdd = () => {
    if (!newText.trim()) return;
    addItem.mutate(newText.trim(), { onSuccess: () => setNewText("") });
  };

  const handleSave = () => {
    if (!editingId || !editingText.trim()) {
      setEditingId(null);
      return;
    }
    updateItem.mutate(
      { id: editingId, texto: editingText.trim() },
      { onSuccess: () => { setEditingId(null); setEditingText(""); } }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-md bg-muted/40 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          Estes itens são aplicados automaticamente a cada novo cliente. Mudanças aqui não afetam clientes
          existentes — use o botão <strong>Aplicar checklist padrão</strong> dentro de cada card.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Novo item do processo de CS..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="h-8 text-sm flex-1"
        />
        <Button size="sm" onClick={handleAdd} disabled={!newText.trim() || addItem.isPending} className="h-8 gap-1">
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum item no template ainda. Adicione o primeiro item acima.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg border bg-card group"
            >
              <span className="text-xs text-muted-foreground font-mono w-6 text-center shrink-0">
                {idx + 1}
              </span>
              {editingId === item.id ? (
                <Input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") { setEditingId(null); setEditingText(""); }
                  }}
                  className="h-7 text-sm flex-1"
                  autoFocus
                />
              ) : (
                <span className="text-sm flex-1">{item.texto}</span>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId === item.id ? (
                  <>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => { setEditingId(null); setEditingText(""); }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => { setEditingId(item.id); setEditingText(item.texto); }}
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
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
