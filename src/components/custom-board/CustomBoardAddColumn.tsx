import { useState, forwardRef } from "react";
import { useCreateCustomBoardColumn } from "@/hooks/useCustomBoardColumns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface CustomBoardAddColumnProps {
  boardId: string;
}

export const CustomBoardAddColumn = forwardRef<HTMLDivElement, CustomBoardAddColumnProps>(
  function CustomBoardAddColumn({ boardId }, ref) {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");

    const createColumn = useCreateCustomBoardColumn();

    const handleAdd = () => {
      if (!name.trim()) return;

      createColumn.mutate({
        boardId,
        name: name.trim(),
      });

      setName("");
      setIsAdding(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleAdd();
      } else if (e.key === "Escape") {
        setIsAdding(false);
        setName("");
      }
    };

    if (isAdding) {
      return (
        <Card ref={ref} className="min-w-[280px] bg-zinc-900 border border-zinc-800/50">
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
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!name.trim() || createColumn.isPending}
              >
                Criar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setName("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div ref={ref}>
        <Button
          variant="outline"
          className="min-w-[280px] h-12 border border-dashed border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/50 hover:border-zinc-700 gap-2"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4" />
          Nova Coluna
        </Button>
      </div>
    );
  }
);
