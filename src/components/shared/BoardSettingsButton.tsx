import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Column {
  id: string;
  name: string;
  color?: string | null;
  is_done_column?: boolean;
}

interface BoardSettingsButtonProps {
  columns: Column[];
  hideOverdueColumns: string[];
  onSave: (columnIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function BoardSettingsButton({
  columns,
  hideOverdueColumns,
  onSave,
  isLoading,
}: BoardSettingsButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(hideOverdueColumns);
  const [saving, setSaving] = useState(false);

  const handleOpen = () => {
    setSelectedColumns(hideOverdueColumns);
    setOpen(true);
  };

  const handleToggle = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(selectedColumns);
      toast.success("Configurações salvas com sucesso");
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleOpen}
        title="Configurações do board"
        disabled={isLoading}
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800/60 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-zinc-800/50 bg-zinc-900/20">
            <DialogTitle className="font-heading text-lg text-zinc-100 flex items-center gap-2">
              <Settings className="h-4 w-4 text-[#CBC5EA]" />
              Configurações do Board
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mt-2 leading-relaxed">
              Selecione as colunas onde a flag de <span className="text-red-400 font-medium tracking-wide">"ATRASADO"</span> não deve aparecer (útil para colunas de conclusão).
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <div className="space-y-1">
              {columns.map((column) => (
                <label
                  key={column.id}
                  htmlFor={column.id}
                  className="flex items-center gap-3.5 p-3 rounded-lg hover:bg-zinc-900/50 cursor-pointer transition-colors border border-transparent hover:border-zinc-800/50 group"
                >
                  <Checkbox
                    id={column.id}
                    checked={selectedColumns.includes(column.id)}
                    onCheckedChange={() => handleToggle(column.id)}
                    className="border-zinc-700 data-[state=checked]:bg-[#3F1757] data-[state=checked]:border-[#3F1757] h-4 w-4"
                  />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: column.color || "#6366f1", boxShadow: `0 0 10px ${column.color || "#6366f1"}40` }}
                    />
                    <span className="font-medium text-zinc-300 group-hover:text-white transition-colors truncate">
                      {column.name}
                    </span>
                    {column.is_done_column && (
                      <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded ml-auto flex-shrink-0 border border-emerald-500/20">
                        Concluída
                      </span>
                    )}
                  </div>
                </label>
              ))}

              {columns.length === 0 && (
                <div className="text-center py-8 bg-zinc-900/20 rounded-lg border border-dashed border-zinc-800/60">
                  <p className="text-sm text-zinc-500 italic">Nenhuma coluna disponível</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 pt-0 sm:justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent border-zinc-700 hover:bg-zinc-800 hover:text-white">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0 shadow-lg">
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
