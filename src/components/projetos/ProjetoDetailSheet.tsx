import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Projeto } from "@/hooks/useProjetos";
import { ProjetoDetailTabs } from "./detail/ProjetoDetailTabs";
import { Pencil } from "lucide-react";

interface ProjetoDetailSheetProps {
  projeto: Projeto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  voo_solo: "Voo Solo",
  ativo: "Ativo",
  concluido: "Concluído",
  pausado: "Pausado",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  voo_solo: "default",
  ativo: "default",
  concluido: "secondary",
  pausado: "outline",
};

export function ProjetoDetailSheet({
  projeto,
  open,
  onOpenChange,
  onEdit,
}: ProjetoDetailSheetProps) {
  if (!projeto) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-left truncate font-['Krona_One']">
                {projeto.company_name || "Projeto sem nome"}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={STATUS_VARIANTS[projeto.status || ""] || "outline"}>
                  {STATUS_LABELS[projeto.status || ""] || projeto.status || "Sem status"}
                </Badge>
                {projeto.client_type && (
                  <Badge variant="outline">{projeto.client_type}</Badge>
                )}
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="gap-2 flex-shrink-0">
                <Pencil className="h-3 w-3" />
                Editar
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          <ProjetoDetailTabs projeto={projeto} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
