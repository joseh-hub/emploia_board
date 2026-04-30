import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays, X } from "lucide-react";
import { format, isBefore, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUpdateTarefaDates } from "@/hooks/useTarefaTags";
import { cn } from "@/lib/utils";

interface InlineDateEditorProps {
  tarefaId: string;
  startDate: string | null;
  dueDate: string | null;
}

export function InlineDateEditor({ tarefaId, startDate, dueDate }: InlineDateEditorProps) {
  const [open, setOpen] = useState(false);
  const updateDates = useUpdateTarefaDates();

  const startDateParsed = startDate ? parseISO(startDate) : undefined;
  const dueDateParsed = dueDate ? parseISO(dueDate) : undefined;

  const isOverdue = dueDateParsed && isBefore(dueDateParsed, new Date()) && !isToday(dueDateParsed);
  const isDueToday = dueDateParsed && isToday(dueDateParsed);

  const handleStartDateChange = (date: Date | undefined) => {
    updateDates.mutate({
      tarefaId,
      startDate: date ? date.toISOString() : null,
      dueDate: dueDate,
    });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    updateDates.mutate({
      tarefaId,
      startDate: startDate,
      dueDate: date ? date.toISOString() : null,
    });
  };

  const handleClearDates = () => {
    updateDates.mutate({
      tarefaId,
      startDate: null,
      dueDate: null,
    });
    setOpen(false);
  };

  const formatDateDisplay = () => {
    if (!startDateParsed && !dueDateParsed) return null;

    if (isDueToday) {
      return "Hoje";
    }

    const parts: string[] = [];
    if (startDateParsed) {
      parts.push(format(startDateParsed, "dd/MM", { locale: ptBR }));
    }
    if (dueDateParsed) {
      parts.push(format(dueDateParsed, "dd/MM", { locale: ptBR }));
    }

    return parts.join(" - ");
  };

  const displayText = formatDateDisplay();

  const triggerButton = (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-6 px-2 text-xs gap-1",
        !displayText && "text-muted-foreground hover:text-foreground",
        displayText && isOverdue && "text-destructive hover:text-destructive",
        displayText && isDueToday && "text-warning hover:text-warning",
        displayText && !isOverdue && !isDueToday && "text-muted-foreground hover:text-foreground"
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <CalendarDays className="h-3 w-3" />
      {displayText || "Definir datas"}
    </Button>
  );

  return (
    <div 
      data-no-drag="true" 
      draggable={false}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {triggerButton}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto p-0 bg-popover z-50"
          onPointerDownCapture={(e) => e.stopPropagation()}
          onClickCapture={(e) => e.stopPropagation()}
        >
          <DatePickerContent
            startDate={startDateParsed}
            dueDate={dueDateParsed}
            onStartDateChange={handleStartDateChange}
            onDueDateChange={handleDueDateChange}
            onClear={handleClearDates}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface DatePickerContentProps {
  startDate: Date | undefined;
  dueDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onDueDateChange: (date: Date | undefined) => void;
  onClear: () => void;
}

function DatePickerContent({
  startDate,
  dueDate,
  onStartDateChange,
  onDueDateChange,
  onClear,
}: DatePickerContentProps) {
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Datas</h4>
        {(startDate || dueDate) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground"
            onClick={onClear}
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Data de Início</label>
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            className="rounded-md border pointer-events-auto"
            locale={ptBR}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Data Prevista</label>
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={onDueDateChange}
            disabled={(date) => startDate ? isBefore(date, startDate) : false}
            className="rounded-md border pointer-events-auto"
            locale={ptBR}
          />
        </div>
      </div>
    </div>
  );
}
