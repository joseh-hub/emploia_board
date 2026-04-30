import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutGrid,
  MoreHorizontal,
  Archive,
  Trash2,
  ChevronRight,
  X,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomBoardDetailHeaderProps {
  title: string;
  boardName?: string;
  onTitleChange: (value: string) => void;
  onTitleBlur: () => void;
  onTitleKeyDown: (e: React.KeyboardEvent) => void;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function CustomBoardDetailHeader({
  title,
  boardName,
  onTitleChange,
  onTitleBlur,
  onTitleKeyDown,
  onArchive,
  onDelete,
  onClose,
}: CustomBoardDetailHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const saveRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed);
      // trigger blur to persist via parent
      onTitleBlur();
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveRename();
    if (e.key === "Escape") {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="border-b border-zinc-800/50 bg-zinc-950 sticky top-0 z-10">
      {/* Single compact line: breadcrumb + title + actions */}
      <div className="flex items-center gap-2 px-5 py-3">
        {boardName && (
          <>
            <Badge
              variant="outline"
              className="bg-zinc-900 border-zinc-700 gap-1.5 font-medium text-xs text-zinc-300 shrink-0"
            >
              <LayoutGrid className="h-3 w-3" />
              {boardName}
            </Badge>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          </>
        )}

        {isEditing ? (
          <input
            ref={inputRef}
            className="font-['Krona_One'] text-sm text-zinc-100 flex-1 min-w-0 bg-zinc-900 border border-[#3F1757]/50 rounded px-2 py-1 outline-none"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveRename}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <h2
            className="font-['Krona_One'] text-sm text-zinc-100 truncate flex-1 min-w-0 cursor-text hover:text-[#CBC5EA] transition-colors"
            onDoubleClick={() => setIsEditing(true)}
            title="Clique duplo para renomear"
          >
            {title}
          </h2>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-zinc-900 border-zinc-800">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Arquivar
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (confirm("Tem certeza que deseja excluir este card?")) {
                    onDelete();
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
