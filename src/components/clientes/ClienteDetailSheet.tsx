import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cliente } from "@/hooks/useClientes";
import { ClienteDetailTabs } from "./detail/ClienteDetailTabs";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClienteDetailSheetProps {
  cliente: Cliente | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

interface ClienteWithDescription extends Cliente {
  description?: string | null;
}

export function ClienteDetailSheet({
  cliente,
  open,
  onOpenChange,
  onEdit,
}: ClienteDetailSheetProps) {
  const [fullCliente, setFullCliente] = useState<ClienteWithDescription | null>(null);

  useEffect(() => {
    if (cliente && open) {
      // Fetch full cliente data including description
      supabase
        .from("metadata_clientes")
        .select("*")
        .eq("id", cliente.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setFullCliente({
              ...cliente,
              description: data.description,
            });
          } else {
            setFullCliente(cliente);
          }
        });
    } else {
      setFullCliente(null);
    }
  }, [cliente, open]);

  if (!cliente) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-left truncate font-['Krona_One']">{cliente.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={cliente.status === "ATIVO" ? "default" : "secondary"}>
                  {cliente.status || "Sem status"}
                </Badge>
                <Badge variant="outline">{cliente.Tipo?.replace("\r\n", "") || "Sem tipo"}</Badge>
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
          {fullCliente && <ClienteDetailTabs cliente={fullCliente} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
