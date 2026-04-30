import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BoardColumn as BoardColumnType } from "@/hooks/useBoardColumns";
import { Cliente } from "@/hooks/useClientes";
import { BoardCard } from "./BoardCard";
import { ColumnHeader } from "./ColumnHeader";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  column: BoardColumnType;
  clientes: Cliente[];
  onUpdateColumn: (id: string, data: { name?: string; color?: string }) => void;
  onDeleteColumn: (id: string) => void;
  onMoveCliente: (clienteId: number, columnId: string) => void;
  onViewCliente: (cliente: Cliente) => void;
}

export function BoardColumn({
  column,
  clientes,
  onUpdateColumn,
  onDeleteColumn,
  onMoveCliente,
  onViewCliente,
}: BoardColumnProps) {
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
    
    const clienteId = e.dataTransfer.getData("clienteId");
    if (clienteId) {
      onMoveCliente(parseInt(clienteId), column.id);
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
      <ColumnHeader
        column={column}
        count={clientes.length}
        onUpdateName={(name) => onUpdateColumn(column.id, { name })}
        onUpdateColor={(color) => onUpdateColumn(column.id, { color })}
        onDelete={() => onDeleteColumn(column.id)}
        placement="top"
      />

      <div className="p-2 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-1">
            {clientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-zinc-600 text-sm mb-2">
                  Arraste clientes aqui
                </p>
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-800" />
              </div>
            ) : (
              clientes.map((cliente) => (
                <BoardCard
                  key={cliente.id}
                  cliente={cliente}
                  onView={onViewCliente}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
