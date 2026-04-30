import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Projeto } from "@/hooks/useProjetos";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { semanticBadge } from "@/components/shared/BadgeStyles";

interface ProjetoBoardCardProps {
  projeto: Projeto;
  onView?: (projeto: Projeto) => void;
  isDragging?: boolean;
  hideOverdue?: boolean;
}

export function ProjetoBoardCard({ projeto, onView, isDragging, hideOverdue }: ProjetoBoardCardProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return format(new Date(date), "d MMM", { locale: ptBR });
  };

  const STAGE_RULES: Record<string, number> = {
    "Onboarding": 5,
    "Desenvolvimento": 25,
    "Produção": 30,
    "Métricas": 60,
  };

  const getTimingBadge = () => {
    const timing = projeto.timing;
    if (!timing) return null;
    if (timing === "ATRASADO" && hideOverdue) return null;
    if (timing === "ATRASADO") return { label: "Atrasado", variant: "destructive" as const };
    if (timing === "ADIANTADO") return { label: "Adiantado", variant: "success" as const };
    return null; // ONTIME = no badge
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("projetoId", projeto.project_id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onView?.(projeto);
  };

  const responsaveis = Array.isArray(projeto.responsavelTecnico) 
    ? projeto.responsavelTecnico 
    : [];

  const timingBadge = getTimingBadge();
  const createdDate = formatDate(projeto.created_at);

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onClick={handleDoubleClick}
      className={cn(
        "relative group cursor-pointer border border-zinc-800/50 bg-zinc-900 rounded-xl transition-all duration-200",
        "hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20",
        "active:cursor-grabbing",
        isDragging && "opacity-50 rotate-1 shadow-lg ring-2 ring-[#3F1757]/50"
      )}
    >
      <CardContent className="p-4 flex flex-col gap-3.5">
        {/* Header */}
        <div>
          <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 block">
            {projeto.client_type || "Projeto"}
          </span>
          <h4 className="text-zinc-100 font-medium text-sm leading-snug line-clamp-2 pr-1">
            {projeto.project_name || projeto.company_name || "Sem nome"}
          </h4>
        </div>

        {/* Info (Values & Hours) */}
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-sm font-semibold text-zinc-200 tracking-tight">
            {formatCurrency(projeto.monthly_value)}
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">
             {projeto.horas || 0}h
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between pt-3 mt-1 border-t border-zinc-800/60 gap-1">
          <div className="flex flex-col gap-2">
            {timingBadge && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] px-1.5 h-4 w-fit uppercase tracking-widest",
                  semanticBadge[timingBadge.variant]
                )}
              >
                {timingBadge.label}
              </Badge>
            )}
            {createdDate && (
              <span className="text-[10px] font-medium text-zinc-500">
                Início: {createdDate}
              </span>
            )}
          </div>

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
                    className={cn("h-6 w-6 border-2 border-zinc-900", index > 0 && "-ml-2")}
                    style={{ zIndex: 10 - index }}
                  >
                    <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-300 font-medium tracking-tighter shadow-inner">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              {responsaveis.length === 1 && (
                <span className="text-[10px] text-zinc-500 truncate max-w-[70px] ml-1.5 font-medium">
                  {responsaveis[0].split(" ")[0]}
                </span>
              )}
            </div>
          ) : (
            <div className="h-6" /> // Placeholder height match
          )}
        </div>
      </CardContent>
    </Card>
  );
}
