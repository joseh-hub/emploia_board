import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ListChecks } from "lucide-react";
import { Cliente } from "@/hooks/useClientes";
import { useClientesChecklistCounts } from "@/hooks/useClientesChecklistCounts";
import { cn } from "@/lib/utils";

interface BoardCardProps {
  cliente: Cliente;
  onView?: (cliente: Cliente) => void;
  isDragging?: boolean;
}

export function BoardCard({ cliente, onView, isDragging }: BoardCardProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("clienteId", cliente.id.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onView?.(cliente);
  };

  const handleClick = () => {
    onView?.(cliente);
  };

  const responsaveis = Array.isArray(cliente.responsavelTecnico) 
    ? cliente.responsavelTecnico 
    : [];

  const { data: counts } = useClientesChecklistCounts();
  const checklist = counts?.[cliente.id];
  const checklistDone = checklist && checklist.total > 0 && checklist.completed === checklist.total;

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
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
            {cliente.Tipo?.replace("\r\n", "") || "Cliente"}
          </span>
          <h4 className="text-zinc-100 font-medium text-sm leading-snug line-clamp-2 pr-1">
            {cliente.name}
          </h4>
        </div>

        {/* Info (Values & Hours) */}
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-sm font-semibold text-zinc-200 tracking-tight">
            {formatCurrency(cliente.receita)}
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">
             {cliente.horas || 0}h
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-zinc-800/60 gap-1">
          {/* Checklist progress */}
          {checklist && checklist.total > 0 ? (
            <div
              className={cn(
                "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                checklistDone
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-400 bg-zinc-800/60"
              )}
              title={`${checklist.completed}/${checklist.total} itens concluídos`}
            >
              <ListChecks className="h-3 w-3" />
              <span>{checklist.completed}/{checklist.total}</span>
            </div>
          ) : (
            <span />
          )}
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
