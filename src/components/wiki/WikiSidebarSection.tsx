import { useState, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface WikiSidebarSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: number;
  action?: ReactNode;
}

export function WikiSidebarSection({
  title,
  icon,
  children,
  defaultOpen = true,
  badge,
  action,
}: WikiSidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="px-2">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
            {icon}
            <span className="flex-1 text-left">{title}</span>
            {typeof badge === "number" && badge > 0 && (
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
            {action && (
              <span onClick={(e) => e.stopPropagation()}>{action}</span>
            )}
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="pb-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
