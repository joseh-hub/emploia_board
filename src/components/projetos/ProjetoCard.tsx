import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Projeto } from "@/hooks/useProjetos";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjetoCardProps {
  projeto: Projeto;
  onView?: (projeto: Projeto) => void;
}

export function ProjetoCard({ projeto, onView }: ProjetoCardProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "d MMM", { locale: ptBR });
  };

  const statusLabel = (status: string | null) => {
    if (!status) return "Sem status";
    if (status.toLowerCase() === "voo_solo") return "Voo Solo";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getStatusDotColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "voo_solo": return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]";
      case "ativo": return "bg-[#3F1757] shadow-[0_0_8px_rgba(63,23,87,0.5)]";
      case "pausado": return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]";
      case "concluido": return "bg-zinc-500";
      default: return "bg-zinc-600";
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onView?.(projeto);
  };

  const responsaveis = Array.isArray(projeto.responsavelTecnico) 
    ? projeto.responsavelTecnico 
    : [];

  const dotColor = getStatusDotColor(projeto.status);

  return (
    <Card
      onClick={handleDoubleClick}
      className={cn(
        "relative group cursor-pointer border border-zinc-800/60 bg-zinc-900/80 rounded-xl transition-all duration-300",
        "hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-xl hover:shadow-black/20"
      )}
    >
      <CardContent className="p-5 flex flex-col h-full gap-5">
        
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
              {projeto.client_type || "Projeto"}
            </span>
            <div className="flex items-center gap-1.5 bg-zinc-950/50 px-2.5 py-1 rounded-full border border-zinc-800/50">
               <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
               <span className="text-[10px] font-medium text-zinc-400 tracking-wide">
                 {statusLabel(projeto.status)}
               </span>
            </div>
          </div>
          <h4 className="text-zinc-100 font-medium text-base leading-snug line-clamp-2 pr-2">
            {projeto.project_name || projeto.company_name || "Sem nome"}
          </h4>
        </div>

        {/* Info (Values & Hours) */}
        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-semibold text-zinc-200 tracking-tight">
              {formatCurrency(projeto.monthly_value)}
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">
               {projeto.horas || 0}h dedicadas
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
              <div className="h-7" /> // placeholder to keep alignment
            )}

            {/* Date */}
            {projeto.v1_delivery_date ? (
              <span className="text-[10px] font-medium text-zinc-500 bg-zinc-950/40 border border-zinc-800/40 px-1.5 py-0.5 rounded">
                 V1: {formatDate(projeto.v1_delivery_date)}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-zinc-600 px-1.5 py-0.5">
                 V1: Não definida
              </span>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
