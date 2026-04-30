import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text: string | null | undefined;
  maxLength?: number;
  className?: string;
}

export function ExpandableText({ 
  text, 
  maxLength = 150, 
  className 
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate 
    ? text 
    : text.slice(0, maxLength) + "...";

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-sm whitespace-pre-wrap break-words">{displayText}</p>
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs text-primary hover:text-primary/80"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Ver mais
            </>
          )}
        </Button>
      )}
    </div>
  );
}
