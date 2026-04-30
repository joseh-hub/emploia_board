import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  FolderKanban,
  BookOpen,
  MoreHorizontal,
  Share2,
  Copy,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TaskDetailHeaderProps {
  title: string;
  projectName?: string;
  isPrioritized: boolean;
  hasWikiFile?: boolean;
  onOpenWiki?: () => void;
  onClose: () => void;
  onRename?: (newTitle: string) => void;
  onDelete?: () => void;
}

export function TaskDetailHeader({
  title,
  projectName,
  isPrioritized,
  hasWikiFile,
  onOpenWiki,
  onClose,
  onRename,
  onDelete,
}: TaskDetailHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const saveRename = () => {
    if (editValue.trim() && editValue !== title && onRename) {
      onRename(editValue.trim());
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
        {projectName && (
          <>
            <Badge variant="outline" className="bg-zinc-900 border-zinc-700 gap-1.5 font-medium text-xs text-zinc-300 shrink-0">
              <FolderKanban className="h-3 w-3" />
              {projectName}
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
          <TooltipProvider delayDuration={300}>
            {isPrioritized && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-8 w-8 flex items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Tarefa priorizada</TooltipContent>
              </Tooltip>
            )}

            {hasWikiFile && onOpenWiki && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={onOpenWiki}>
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Documentação</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-zinc-900 border-zinc-800">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
                    onDelete?.();
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
