import { useState } from "react";
import { CustomBoardColumn } from "@/hooks/useCustomBoardColumns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { MoreHorizontal, Pencil, Trash2, Palette, Check, Lock } from "lucide-react";

interface CustomBoardColumnHeaderProps {
  column: CustomBoardColumn;
  cardCount: number;
  onUpdate: (data: { name?: string; color?: string }) => void;
  onDelete: () => void;
  canDelete: boolean;
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

export function CustomBoardColumnHeader({
  column,
  cardCount,
  onUpdate,
  onDelete,
  canDelete,
}: CustomBoardColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);

  const isDoneColumn = column.is_done_column;

  const handleSaveName = () => {
    if (isDoneColumn) return;
    if (editName.trim() && editName !== column.name) {
      onUpdate({ name: editName.trim() });
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

  const handleColorSelect = (color: string) => {
    if (isDoneColumn) return;
    onUpdate({ color });
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-zinc-800/50">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: column.color }}
        />
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
          {cardCount}
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
              <DropdownMenuSubContent className="bg-zinc-900 border-zinc-800">
                {COLUMN_COLORS.map((color) => (
                  <DropdownMenuItem
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                    {column.color === color && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
              disabled={!canDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {canDelete ? "Excluir coluna" : "Mova os cards primeiro"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
