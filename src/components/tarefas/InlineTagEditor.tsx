import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { TagSelector } from "./TagSelector";
import { TarefaTag } from "@/hooks/useTarefaTags";

interface InlineTagEditorProps {
  tarefaId: string;
  tags: TarefaTag[];
  maxVisible?: number;
}

export function InlineTagEditor({ tarefaId, tags, maxVisible = 3 }: InlineTagEditorProps) {
  const [open, setOpen] = useState(false);

  const visibleTags = tags.slice(0, maxVisible);
  const hiddenTags = tags.slice(maxVisible);
  const assignedTagIds = tags.map((t) => t.id);

  return (
    <div 
      className="flex items-center gap-1 flex-wrap" 
      data-no-drag="true"
      draggable={false}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {visibleTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="outline"
          className="text-xs px-1.5 py-0 h-5 border-0"
          style={{
            backgroundColor: `${tag.color}20`,
            color: tag.color,
          }}
        >
          {tag.name}
        </Badge>
      ))}

      {hiddenTags.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0 h-5 cursor-help"
                >
                  +{hiddenTags.length}
                </Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-1">
                {hiddenTags.map((tag) => (
                  <span key={tag.id} className="text-xs">
                    {tag.name}
                  </span>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-muted"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-64 bg-popover z-50"
          onPointerDownCapture={(e) => e.stopPropagation()}
          onClickCapture={(e) => e.stopPropagation()}
        >
          <h4 className="font-medium text-sm mb-3">Tags</h4>
          <TagSelector
            tarefaId={tarefaId}
            assignedTagIds={assignedTagIds}
            onClose={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
