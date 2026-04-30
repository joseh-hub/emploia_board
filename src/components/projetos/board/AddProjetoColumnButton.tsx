import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface AddProjetoColumnButtonProps {
  onAdd: (name: string) => void;
}

export function AddProjetoColumnButton({ onAdd }: AddProjetoColumnButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isAdding) {
    return (
      <Card className="min-w-[280px] bg-zinc-900 border border-zinc-800/50">
        <CardContent className="p-3 space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome da coluna..."
            className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-500"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!name.trim()}>
              Criar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
