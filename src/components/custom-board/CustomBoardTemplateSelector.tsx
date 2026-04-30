import { useState } from "react";
import { FileText, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTaskTemplates, TaskTemplateChecklist } from "@/hooks/useTaskTemplates";
import { cn } from "@/lib/utils";
import { ChecklistItem } from "./CustomBoardChecklistSection";

export interface TemplateApplyResult {
  items: ChecklistItem[];
  sendMessageOnComplete: boolean;
  completionMessage: string | null;
}

interface CustomBoardTemplateSelectorProps {
  onApply: (result: TemplateApplyResult) => void;
  className?: string;
}

export function CustomBoardTemplateSelector({ 
  onApply, 
  className 
}: CustomBoardTemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: templates, isLoading } = useTaskTemplates();

  const handleApplyTemplate = (template: { checklists?: TaskTemplateChecklist[]; send_message_on_complete: boolean; completion_message: string | null }) => {
    const newItems: ChecklistItem[] = (template.checklists || []).map((item) => ({
      id: crypto.randomUUID(),
      text: item.texto,
      completed: false,
    }));
    onApply({
      items: newItems,
      sendMessageOnComplete: template.send_message_on_complete,
      completionMessage: template.completion_message,
    });
    setOpen(false);
  };

  const globalTemplates = templates?.filter((t) => t.is_global) || [];
  const otherTemplates = templates?.filter((t) => !t.is_global) || [];
  const hasTemplates = (globalTemplates.length > 0 || otherTemplates.length > 0);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Template
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-popover">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : !hasTemplates ? (
          <div className="py-4 px-3 text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Nenhum template disponível</p>
            <p className="text-xs mt-1">Crie templates em Ferramentas → Templates</p>
          </div>
        ) : (
          <>
            {globalTemplates.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Templates Globais
                </DropdownMenuLabel>
                {globalTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleApplyTemplate(template)}
                    className="cursor-pointer"
                    disabled={!template.checklists || template.checklists.length === 0}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{template.name}</span>
                      {template.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {template.checklists && template.checklists.length > 0 
                          ? `${template.checklists.length} itens de checklist`
                          : "Sem itens de checklist"
                        }
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {globalTemplates.length > 0 && otherTemplates.length > 0 && (
              <DropdownMenuSeparator />
            )}

            {otherTemplates.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Outros Templates
                </DropdownMenuLabel>
                {otherTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleApplyTemplate(template)}
                    className="cursor-pointer"
                    disabled={!template.checklists || template.checklists.length === 0}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{template.name}</span>
                      {template.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {template.checklists && template.checklists.length > 0 
                          ? `${template.checklists.length} itens de checklist`
                          : "Sem itens de checklist"
                        }
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
