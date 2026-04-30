import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { format } from "date-fns";

interface Props {
  initialNote?: string | null;
  initialDate?: string | null;
  onCancel: () => void;
  onConfirm: (data: { nota: string; executado_em: string }) => void;
  isPending?: boolean;
  /** When true, the panel is editing a completed item (showing existing note). */
  editing?: boolean;
}

export function RegistrarExecucaoPanel({
  initialNote,
  initialDate,
  onCancel,
  onConfirm,
  isPending,
  editing,
}: Props) {
  const [nota, setNota] = useState(initialNote || "");
  const [date, setDate] = useState(
    initialDate ? initialDate.slice(0, 10) : format(new Date(), "yyyy-MM-dd")
  );

  return (
    <div
      className="mt-2 ml-6 rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2.5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-primary/80">
          {editing ? "Editar registro" : "Registrar execução"}
        </span>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-7 text-xs w-[140px] bg-background"
        />
      </div>
      <Textarea
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="O que aconteceu? Decisões, próximos passos, links de gravação…"
        rows={3}
        className="text-sm bg-background resize-none"
        autoFocus
      />
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-7 px-2 text-xs"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => onConfirm({ nota: nota.trim(), executado_em: date })}
          disabled={isPending}
          className="h-7 px-3 text-xs gap-1"
        >
          <Check className="h-3.5 w-3.5" />
          {editing ? "Salvar" : "Concluir e salvar"}
        </Button>
      </div>
    </div>
  );
}
