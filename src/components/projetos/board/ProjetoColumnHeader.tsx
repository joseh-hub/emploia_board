import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Palette, Check, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { ProjetoBoardColumn } from "@/hooks/useProjetoBoardColumns";
import { cn } from "@/lib/utils";

interface ProjetoColumnHeaderProps {
  column: ProjetoBoardColumn;
  count: number;
  onUpdateName: (name: string) => void;
  onUpdateColor: (color: string) => void;
  onDelete: () => void;
  placement?: "top" | "bottom";
}

const COLUMN_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
];

export function ProjetoColumnHeader({
  column,
  count,
  onUpdateName,
  onUpdateColor,
  onDelete,
  placement = "top",
}: ProjetoColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);

  const isDoneColumn = column.is_done_column;

  const handleSaveName = () => {
    if (isDoneColumn) return;
    if (editName.trim() && editName !== column.name) {
      onUpdateName(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setEditName(column.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3",
        placement === "bottom" ? "border-t border-zinc-800/50" : "border-b border-zinc-800/50"
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {isEditing && !isDoneColumn ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm font-semibold text-zinc-300 bg-zinc-950 border-zinc-800"
            autoFocus
          />
        ) : (
          <span className="text-zinc-300 font-semibold text-sm tracking-wider truncate flex items-center gap-1">
            {column.name}
            {isDoneColumn && <Lock className="h-3 w-3 text-zinc-500" />}
          </span>
        )}
        <Badge variant="secondary" className="text-xs h-5 px-1.5 flex-shrink-0 bg-zinc-900 border border-zinc-800 text-zinc-400">
          {count}
        </Badge>
      </div>

      {!isDoneColumn && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 w-48" onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem onClick={() => setTimeout(() => setIsEditing(true), 0)}>
              <Pencil className="mr-2 h-4 w-4" />
              Renomear
            </DropdownMenuItem>
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                Alterar cor
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-zinc-950 border-zinc-800 p-2.5 min-w-0 w-fit">
                <div className="grid grid-cols-4 gap-2">
                  {COLUMN_COLORS.map((color) => (
                    <DropdownMenuItem
                      key={color}
                      onClick={() => onUpdateColor(color)}
                      className={cn(
                        "w-5 h-5 min-w-0 min-h-0 rounded-full p-0 flex items-center justify-center cursor-pointer border border-white/10 transition-transform hover:scale-110 focus:scale-110 focus:bg-transparent data-[state=open]:bg-transparent",
                        column.color === color ? "ring-1 ring-white ring-offset-2 ring-offset-zinc-950 scale-110" : ""
                      )}
                      style={{ backgroundColor: color }}
                    >
                      {column.color === color && (
                        <Check className="h-3 w-3 text-white drop-shadow-md" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
              disabled={count > 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
              {count > 0 && (
                <span className="ml-2 text-xs text-zinc-500">(vazia)</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
