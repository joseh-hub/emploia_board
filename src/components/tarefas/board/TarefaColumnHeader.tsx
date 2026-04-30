import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Palette, Check, Lock } from "lucide-react";
import { TarefaBoardColumn, useUpdateTarefaColumn, useDeleteTarefaColumn } from "@/hooks/useTarefaBoardColumns";
import { cn } from "@/lib/utils";

interface TarefaColumnHeaderProps {
  column: TarefaBoardColumn;
  tarefaCount: number;
  placement?: "top" | "bottom";
}

const COLORS = [
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

export function TarefaColumnHeader({ column, tarefaCount, placement = "top" }: TarefaColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);

  const updateColumn = useUpdateTarefaColumn();
  const deleteColumn = useDeleteTarefaColumn();

  const isDoneColumn = column.is_done_column;

  const handleSaveName = () => {
    if (isDoneColumn) return;
    if (editName.trim() && editName !== column.name) {
      updateColumn.mutate({ id: column.id, name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleColorChange = (color: string) => {
    if (isDoneColumn) return;
    updateColumn.mutate({ id: column.id, color });
  };

  const handleDelete = () => {
    if (tarefaCount > 0 || isDoneColumn) {
      return;
    }
    deleteColumn.mutate(column.id);
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
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName();
              if (e.key === "Escape") {
                setEditName(column.name);
                setIsEditing(false);
              }
            }}
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
          {tarefaCount}
        </Badge>
      </div>

      {!isDoneColumn && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800" onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem onClick={() => setTimeout(() => setIsEditing(true), 0)}>
              <Pencil className="mr-2 h-4 w-4" />
              Renomear
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                Alterar cor
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-zinc-950 border-zinc-800 p-2.5 w-[190px] shadow-2xl">
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleColorChange(color);
                      }}
                      className={cn(
                        "w-6 h-6 rounded-md transition-all outline-none flex items-center justify-center cursor-pointer",
                        column.color === color 
                          ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110 shadow-lg z-10" 
                          : "border border-zinc-700/50 hover:scale-110 hover:shadow-md hover:z-10 hover:border-white/50"
                      )}
                      style={{ backgroundColor: color }}
                      title="Selecionar cor"
                    />
                  ))}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
              disabled={tarefaCount > 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
              {tarefaCount > 0 && (
                <span className="ml-2 text-xs text-zinc-500">(vazia)</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
