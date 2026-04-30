import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCustomBoardColumns } from "@/hooks/useCustomBoardColumns";
import { useUpdateBoard, CustomBoard } from "@/hooks/useCustomBoards";
import { Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: CustomBoard;
}

export function BoardSettingsModal({
  open,
  onOpenChange,
  board,
}: BoardSettingsModalProps) {
  const { data: columns = [] } = useCustomBoardColumns(board.id);
  const updateBoard = useUpdateBoard();
  
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Initialize selected columns from board settings
  useEffect(() => {
    if (open) {
      // Pre-select columns that are already configured OR are marked as done columns
      const initialSelection = [
        ...(board.hide_overdue_columns || []),
        ...columns
          .filter((col) => col.is_done_column && !(board.hide_overdue_columns || []).includes(col.id))
          .map((col) => col.id),
      ];
      setSelectedColumns([...new Set(initialSelection)]);
    }
  }, [open, board.hide_overdue_columns, columns]);

  const handleToggleColumn = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSave = () => {
    updateBoard.mutate(
      {
        id: board.id,
        hide_overdue_columns: selectedColumns,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configurações do Board
          </DialogTitle>
          <DialogDescription>
            Configure o comportamento do board para suas necessidades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Ocultar flag "Atrasado" nas colunas:
            </div>
            <p className="text-xs text-muted-foreground">
              Cards nestas colunas não exibirão a flag de "Atrasado" mesmo que
              a data de término já tenha passado.
            </p>

            <ScrollArea className="h-[200px] rounded-md border p-3">
              <div className="space-y-3">
                {columns.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma coluna disponível
                  </p>
                ) : (
                  columns
                    .sort((a, b) => a.position - b.position)
                    .map((column) => (
                      <div
                        key={column.id}
                        className={cn(
                          "flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors",
                          selectedColumns.includes(column.id) && "bg-muted/30"
                        )}
                      >
                        <Checkbox
                          id={column.id}
                          checked={selectedColumns.includes(column.id)}
                          onCheckedChange={() => handleToggleColumn(column.id)}
                        />
                        <Label
                          htmlFor={column.id}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: column.color || "#94a3b8" }}
                          />
                          <span className="text-sm">{column.name}</span>
                          {column.is_done_column && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              DONE
                            </span>
                          )}
                        </Label>
                      </div>
                    ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateBoard.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateBoard.isPending}>
              {updateBoard.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
