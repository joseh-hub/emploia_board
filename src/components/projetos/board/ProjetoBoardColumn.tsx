import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjetoBoardColumn as ProjetoBoardColumnType } from "@/hooks/useProjetoBoardColumns";
import { Projeto } from "@/hooks/useProjetos";
import { ProjetoBoardCard } from "./ProjetoBoardCard";
import { ProjetoColumnHeader } from "./ProjetoColumnHeader";
import { cn } from "@/lib/utils";

interface ProjetoBoardColumnProps {
  column: ProjetoBoardColumnType;
  projetos: Projeto[];
  onUpdateColumn: (id: string, data: { name?: string; color?: string }) => void;
  onDeleteColumn: (id: string) => void;
  onMoveProjeto: (projetoId: string, columnId: string) => void;
  onViewProjeto: (projeto: Projeto) => void;
  hideOverdue?: boolean;
}

export function ProjetoBoardColumn({
  column,
  projetos,
  onUpdateColumn,
  onDeleteColumn,
  onMoveProjeto,
  onViewProjeto,
  hideOverdue,
}: ProjetoBoardColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const projetoId = e.dataTransfer.getData("projetoId");
    if (projetoId) {
      onMoveProjeto(projetoId, column.id);
    }
  };

  return (
    <div
      className={cn(
        "min-w-[300px] max-w-[300px] flex-shrink-0 flex flex-col h-[calc(100vh-130px)] rounded-xl border border-zinc-800/50 border-t-2 transition-all duration-200",
        "bg-zinc-950/50",
        isDragOver && "ring-2 ring-[#3F1757]/50 bg-[#3F1757]/5"
      )}
      style={{ borderTopColor: column.color || "#3F1757" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ProjetoColumnHeader
        column={column}
        count={projetos.length}
        onUpdateName={(name) => onUpdateColumn(column.id, { name })}
        onUpdateColor={(color) => onUpdateColumn(column.id, { color })}
        onDelete={() => onDeleteColumn(column.id)}
        placement="top"
      />

      <div className="p-2 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-1">
            {projetos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-zinc-600 text-sm mb-2">
                  Arraste projetos aqui
                </p>
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-800" />
              </div>
            ) : (
              projetos.map((projeto) => (
                <ProjetoBoardCard
                  key={projeto.project_id}
                  projeto={projeto}
                  onView={onViewProjeto}
                  hideOverdue={hideOverdue}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
