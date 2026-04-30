import { forwardRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CustomBoardCard as CardType } from "@/hooks/useCustomBoardCards";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MessageSquare,
  Paperclip,
  Check,
} from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CardContentProps {
  card: CardType;
  isDragging?: boolean;
  onQuickComplete?: () => void;
  hideOverdue?: boolean;
}

interface CustomBoardCardProps {
  card: CardType;
  onView: () => void;
  onQuickComplete?: () => void;
  isDragging?: boolean;
  hideOverdue?: boolean;
}

interface CustomBoardCardOverlayProps {
  card: CardType;
}

const priorityDotClass: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-[#CBC5EA]",
  low: "bg-green-500",
};

// Inner card content - reusable for both sortable and overlay versions
function CardContent({ card, isDragging, onQuickComplete, hideOverdue }: CardContentProps) {
  const completedChecklist = card.checklist.filter((item) => item.completed).length;
  const totalChecklist = card.checklist.length;

  const getDueDateStatus = () => {
    if (!card.due_date) return null;
    const dueDate = new Date(card.due_date);
    const today = new Date();
    
    if (isPast(dueDate) && dueDate.toDateString() !== today.toDateString()) {
      // If hideOverdue is true, don't show the "Atrasado" badge
      if (hideOverdue) return null;
      return { label: "Atrasado", variant: "destructive" as const };
    }
    const daysUntil = differenceInDays(dueDate, today);
    if (daysUntil <= 3 && daysUntil >= 0) {
      return { label: "Próximo", variant: "warning" as const };
    }
    return null;
  };

  const dueDateStatus = getDueDateStatus();
  const dotClass = priorityDotClass[card.priority] || "bg-zinc-600";

  return (
    <>
      <div className="p-3.5 pl-4 space-y-3 relative">
        {/* Hover Complete Button */}
        {onQuickComplete && (
          <div
            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            data-no-drag="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
              onClick={(e) => {
                e.stopPropagation();
                onQuickComplete();
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Title + priority dot */}
        <div className="flex items-start gap-2">
          <span className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", dotClass)} aria-hidden />
          <h4 className="text-zinc-100 font-medium text-sm leading-tight line-clamp-2 flex-1 min-w-0">{card.title}</h4>
        </div>

        {/* Tags - premium low opacity */}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs h-5 px-1.5 border"
                style={{
                  backgroundColor: `${tag.color}18`,
                  borderColor: `${tag.color}30`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {card.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-zinc-800/60 text-zinc-400 border border-zinc-700">
                +{card.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Due Date */}
        {(card.due_date || dueDateStatus) && (
          <div className="flex items-center gap-2 text-xs">
            {card.due_date && (
              <div className={cn(
                "flex items-center gap-1.5",
                dueDateStatus?.variant === "destructive" ? "text-red-400" : "text-zinc-500"
              )}>
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(card.due_date), "d MMM", { locale: ptBR })}</span>
              </div>
            )}
            {dueDateStatus && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs h-5 px-1.5 border",
                  dueDateStatus.variant === "destructive" && "bg-red-500/10 border-red-500/20 text-red-400",
                  dueDateStatus.variant === "warning" && "bg-amber-500/10 border-amber-500/20 text-amber-400"
                )}
              >
                {dueDateStatus.label}
              </Badge>
            )}
          </div>
        )}

        {/* Checklist Progress - local thin bar */}
        {totalChecklist > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.round((completedChecklist / totalChecklist) * 100)}%` }}
              />
            </div>
            <span className="text-zinc-500 text-xs shrink-0">
              {completedChecklist}/{totalChecklist}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
          <div className="flex items-center gap-2">
            {card.comments_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <MessageSquare className="h-3 w-3" />
                {card.comments_count}
              </div>
            )}
            {card.attachments_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Paperclip className="h-3 w-3" />
                {card.attachments_count}
              </div>
            )}
          </div>
          {card.assigned_users.length > 0 && (
            <div className="flex items-center">
              {card.assigned_users.slice(0, 3).map((userId, index) => (
                <Avatar
                  key={index}
                  className={cn("h-6 w-6", index > 0 && "-ml-2")}
                  style={{ zIndex: 10 - index }}
                >
                  <AvatarFallback className="text-xs bg-zinc-700 text-zinc-300 font-medium">
                    {userId.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {card.assigned_users.length > 3 && (
                <span className="text-xs text-zinc-500 ml-1">
                  +{card.assigned_users.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Sortable card wrapper - uses hooks
export const CustomBoardCard = forwardRef<HTMLDivElement, CustomBoardCardProps>(
  function CustomBoardCard({ card, onView, onQuickComplete, isDragging, hideOverdue }, ref) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isSortableDragging,
    } = useSortable({ id: card.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "relative group bg-zinc-900 rounded-xl border border-zinc-800/50 cursor-pointer transition-all duration-200",
          "hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20",
          isDragging || isSortableDragging ? "opacity-50 shadow-lg ring-2 ring-[#3F1757]/50" : "",
        )}
        onClick={onView}
      >
        <CardContent card={card} isDragging={isDragging || isSortableDragging} onQuickComplete={onQuickComplete} hideOverdue={hideOverdue} />
      </div>
    );
  }
);

// Overlay card - no hooks, just visual representation
export function CustomBoardCardOverlay({ card }: CustomBoardCardOverlayProps) {
  return (
    <div
      className={cn(
        "relative bg-zinc-900 rounded-xl shadow-lg border border-zinc-700 cursor-grabbing",
        "ring-2 ring-[#3F1757]/50 opacity-90 w-[292px]"
      )}
    >
      <CardContent card={card} isDragging />
    </div>
  );
}
