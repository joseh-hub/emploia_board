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

interface DateSectionEditorProps {
  tarefaId: string;
  startDate: string | null;
  dueDate: string | null;
}

export function DateSectionEditor({ tarefaId, startDate, dueDate }: DateSectionEditorProps) {
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

  const handleClearAll = () => {
    updateDates.mutate({
      tarefaId,
      startDate: null,
      dueDate: null,
    });
  };

  const formatDateDisplay = (date: Date | undefined, label: string) => {
    if (!date) return label;
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Start Date */}
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Data de Início</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDateParsed && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {formatDateDisplay(startDateParsed, "Selecionar data")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={startDateParsed}
                onSelect={handleStartDateChange}
                className="pointer-events-auto"
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Due Date */}
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Data Prevista</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDateParsed && "text-muted-foreground",
                  isOverdue && "border-destructive text-destructive",
                  isDueToday && "border-warning text-warning"
                )}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {isDueToday ? "Hoje" : formatDateDisplay(dueDateParsed, "Selecionar data")}
                {isOverdue && <span className="ml-auto text-xs">(Atrasado)</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={dueDateParsed}
                onSelect={handleDueDateChange}
                disabled={(date) => startDateParsed ? isBefore(date, startDateParsed) : false}
                className="pointer-events-auto"
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Clear Button */}
      {(startDateParsed || dueDateParsed) && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={handleClearAll}
        >
          <X className="h-4 w-4 mr-1" />
          Limpar datas
        </Button>
      )}
    </div>
  );
}
