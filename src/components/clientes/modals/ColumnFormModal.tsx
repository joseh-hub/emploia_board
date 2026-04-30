import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateColumn, useUpdateColumn, BoardColumn } from "@/hooks/useBoardColumns";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColumnFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column?: BoardColumn | null;
}

const COLUMN_COLORS = [
  { name: "Verde", value: "#22c55e" },
  { name: "Amarelo", value: "#eab308" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Laranja", value: "#f97316" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Cinza", value: "#6b7280" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Ciano", value: "#06b6d4" },
];

export function ColumnFormModal({
  open,
  onOpenChange,
  column,
}: ColumnFormModalProps) {
  const isEditing = !!column;
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3F1757");

  const createColumn = useCreateColumn();
  const updateColumn = useUpdateColumn();

  useEffect(() => {
    if (column) {
      setName(column.name);
      setColor(column.color);
    } else {
      setName("");
      setColor("#3F1757");
    }
  }, [column]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    try {
      if (isEditing && column) {
        await updateColumn.mutateAsync({
          id: column.id,
          name: name.trim(),
          color,
        });
      } else {
        await createColumn.mutateAsync({
          name: name.trim(),
          color,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutations
    }
  };

  const isPending = createColumn.isPending || updateColumn.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="font-['Krona_One']">
            {isEditing ? "Editar Coluna" : "Nova Coluna"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Coluna *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Em Análise"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {COLUMN_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110",
                    color === c.value && "ring-2 ring-offset-2 ring-primary"
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()} className="bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0">
              {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
