import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TarefaTag } from "@/hooks/useTarefaTags";

interface TaskTagBadgesProps {
  tags: TarefaTag[];
  maxVisible?: number;
  variant?: "default" | "premium";
}

export function TaskTagBadges({ tags, maxVisible = 2, variant = "default" }: TaskTagBadgesProps) {
  if (!tags || tags.length === 0) return null;

  const visibleTags = tags.slice(0, maxVisible);
  const hiddenTags = tags.slice(maxVisible);
  const isPremium = variant === "premium";

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visibleTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className={cn(
            "text-xs px-1.5 py-0 h-5 font-medium",
            isPremium && "border"
          )}
          style={isPremium
            ? {
                backgroundColor: `${tag.color}18`,
                color: tag.color,
                borderColor: `${tag.color}30`,
              }
            : {
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                borderColor: `${tag.color}40`,
              }}
        >
          {tag.name}
        </Badge>
      ))}
      {hiddenTags.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs px-1.5 py-0 h-5 cursor-default",
                  isPremium ? "bg-zinc-800/60 text-zinc-400 border border-zinc-700" : "bg-muted text-muted-foreground"
                )}
              >
                +{hiddenTags.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="flex flex-wrap gap-1">
                {hiddenTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
