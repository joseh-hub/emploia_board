import { useState } from "react";
import { FileText, ChevronDown, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTaskTemplates, useApplyTemplate } from "@/hooks/useTaskTemplates";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  projetoId: string;
  className?: string;
}

export function TemplateSelector({ projetoId, className }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: templates, isLoading } = useTaskTemplates(projetoId);
  const applyTemplate = useApplyTemplate();

  const handleApplyTemplate = (templateId: string) => {
    applyTemplate.mutate(
      { templateId, projetoId },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const globalTemplates = templates?.filter((t) => t.is_global) || [];
  const projectTemplates = templates?.filter((t) => !t.is_global && t.projeto_id === projetoId) || [];

  const hasTemplates = (globalTemplates.length > 0 || projectTemplates.length > 0);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
          disabled={isLoading || applyTemplate.isPending}
        >
          {applyTemplate.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Template
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover">
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
            {projectTemplates.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Templates do Projeto
                </DropdownMenuLabel>
                {projectTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleApplyTemplate(template.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{template.name}</span>
                      {template.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Título: {template.titulo_padrao}
                        {template.checklists && template.checklists.length > 0 && (
                          <> • {template.checklists.length} itens de checklist</>
                        )}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {projectTemplates.length > 0 && globalTemplates.length > 0 && (
              <DropdownMenuSeparator />
            )}

            {globalTemplates.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Templates Globais
                </DropdownMenuLabel>
                {globalTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleApplyTemplate(template.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{template.name}</span>
                      {template.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Título: {template.titulo_padrao}
                        {template.checklists && template.checklists.length > 0 && (
                          <> • {template.checklists.length} itens de checklist</>
                        )}
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
