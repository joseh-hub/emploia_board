import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cliente } from "@/hooks/useClientes";
import { cn } from "@/lib/utils";

interface ClienteCardProps {
  cliente: Cliente;
  onView?: (cliente: Cliente) => void;
  onEdit?: (cliente: Cliente) => void;
}

export function ClienteCard({ cliente, onView, onEdit }: ClienteCardProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusDotColor = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case "ATIVO": return "bg-[#3F1757] shadow-[0_0_8px_rgba(63,23,87,0.5)]";
      case "INATIVO": return "bg-zinc-500";
      case "PAUSADO": return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]";
      default: return "bg-zinc-600";
    }
  };

  const responsaveis = Array.isArray(cliente.responsavelTecnico) 
    ? cliente.responsavelTecnico 
    : [];

  const dotColor = getStatusDotColor(cliente.status);

  return (
    <Card
      className={cn(
        "relative group border border-zinc-800/60 bg-zinc-900/80 rounded-xl transition-all duration-300",
        "hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-xl hover:shadow-black/20"
      )}
    >
      <CardContent className="p-5 flex flex-col h-full gap-5">
        
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
              {cliente.Tipo || "Cliente"}
            </span>
            <div className="flex items-center gap-1.5">
               <div className="flex items-center gap-1.5 bg-zinc-950/50 px-2.5 py-1 rounded-full border border-zinc-800/50">
                 <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
                 <span className="text-[10px] font-medium text-zinc-400 tracking-wide capitalize">
                   {cliente.status?.toLowerCase() || "Sem status"}
                 </span>
               </div>
               {/* Dropdown Menu */}
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 -mr-1">
                     <MoreHorizontal className="h-4 w-4" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-300">
                   <DropdownMenuItem onClick={() => onView?.(cliente)} className="focus:bg-zinc-900 focus:text-white cursor-pointer">
                     Ver detalhes
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => onEdit?.(cliente)} className="focus:bg-zinc-900 focus:text-white cursor-pointer">
                     Editar
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
          <h4 className="text-zinc-100 font-medium text-base leading-snug line-clamp-2 pr-2">
            {cliente.name || "Sem nome"}
          </h4>
        </div>

        {/* Info (Values & Hours) */}
        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-semibold text-zinc-200 tracking-tight">
              {formatCurrency(cliente.receita)}
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">
               {cliente.horas || 0}h dedicadas
            </span>
          </div>

          <div className="flex flex-col items-end gap-3">
            {/* Avatars */}
            {responsaveis.length > 0 ? (
              <div className="flex items-center">
                {responsaveis.slice(0, 3).map((resp, index) => {
                  const name = resp || "";
                  const userInitials = name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();
                  return (
                    <Avatar
                      key={`${resp}-${index}`}
                      className={cn("h-7 w-7 border-2 border-zinc-900", index > 0 && "-ml-2.5")}
                      style={{ zIndex: 10 - index }}
                    >
                      <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-300 font-medium tracking-tighter shadow-inner">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
                {responsaveis.length > 3 && (
                  <span className="text-[10px] text-zinc-500 ml-1.5 font-medium">
                    +{responsaveis.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <div className="h-7" />
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
