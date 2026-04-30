import { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { useCreateTarefaColumn } from "@/hooks/useTarefaBoardColumns";

export const AddTarefaColumnButton = forwardRef<HTMLDivElement>((_, ref) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");

  const createColumn = useCreateTarefaColumn();

  const handleSubmit = () => {
    if (!name.trim()) return;
    createColumn.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName("");
          setIsAdding(false);
        },
      }
    );
  };

  if (!isAdding) {
    return (
      <Button
        variant="outline"
        className="min-w-[280px] h-12 border border-dashed border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/50 hover:border-zinc-700 gap-2"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="h-4 w-4" />
        Nova Coluna
      </Button>
    );
  }

  return (
    <Card className="min-w-[280px] bg-zinc-900 border border-zinc-800/50">
      <CardContent className="p-3 space-y-3">
        <Input
          placeholder="Nome da coluna..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") {
              setName("");
              setIsAdding(false);
            }
          }}
          className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-500"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!name.trim() || createColumn.isPending}
          >
            Criar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setName("");
              setIsAdding(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

AddTarefaColumnButton.displayName = "AddTarefaColumnButton";
