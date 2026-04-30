import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Plus } from "lucide-react";
import { TagAutocomplete } from "../TagAutocomplete";
import { TarefaTag, useUnassignTag } from "@/hooks/useTarefaTags";
import { cn } from "@/lib/utils";

interface TaskTagsSectionProps {
  tarefaId: string;
  tags: TarefaTag[];
}

export function TaskTagsSection({ tarefaId, tags }: TaskTagsSectionProps) {
  const removeTag = useUnassignTag();

  const handleRemoveTag = (tagId: string) => {
    removeTag.mutate({ tarefaId, tagId });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Current tags - inline with X on hover */}
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant="outline"
          className={cn(
            "group pl-2 pr-1.5 py-1 text-xs font-medium gap-1.5 transition-all",
            "hover:pr-1"
          )}
          style={{
            backgroundColor: `${tag.color}15`,
            borderColor: `${tag.color}30`,
            color: tag.color,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: tag.color }}
          />
          {tag.name}
          <button
            onClick={() => handleRemoveTag(tag.id)}
            className="opacity-0 group-hover:opacity-100 hover:bg-black/10 rounded-full p-0.5 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Popover for adding tags */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 border border-dashed border-zinc-700 rounded-md bg-transparent hover:text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/30 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar tag
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-2 w-auto bg-zinc-900 border-zinc-800" align="start" sideOffset={8}>
          <TagAutocomplete tarefaId={tarefaId} assignedTags={tags} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
