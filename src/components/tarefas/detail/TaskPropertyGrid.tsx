import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User, CalendarDays, Flag, Columns3 } from "lucide-react";
import { format, isToday, isPast, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TaskPropertyGridProps {
  assignedUser: string | null;
  startDate: string | null;
  dueDate: string | null;
  status: string | null;
  responsaveis: string[];
  onAssigneeChange: (assignee: string) => void;
  onStartDateChange: (date: Date | null) => void;
  onDueDateChange: (date: Date | null) => void;
}

export function TaskPropertyGrid({
  assignedUser,
  startDate,
  dueDate,
  status,
  responsaveis,
  onAssigneeChange,
  onStartDateChange,
  onDueDateChange,
}: TaskPropertyGridProps) {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  const parsedStartDate = startDate ? new Date(startDate) : undefined;
  const parsedDueDate = dueDate ? new Date(dueDate) : undefined;

  const isOverdue = parsedDueDate && isPast(parsedDueDate) && !isToday(parsedDueDate);
  const isDueToday = parsedDueDate && isToday(parsedDueDate);
  const isDueTomorrow = parsedDueDate && isTomorrow(parsedDueDate);

  const userInitials = assignedUser
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "";

  const getDueDateBadge = () => {
    if (isOverdue) return { variant: "destructive" as const, label: "Atrasado" };
    if (isDueToday) return { variant: "warning" as const, label: "Hoje" };
    if (isDueTomorrow) return { variant: "secondary" as const, label: "Amanhã" };
    return null;
  };

  const dueBadge = getDueDateBadge();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Responsável */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User className="h-4 w-4" />
          Responsável
        </label>
        <Select value={assignedUser || "none"} onValueChange={onAssigneeChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Selecionar responsável">
              {assignedUser ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{assignedUser}</span>
                </div>
              ) : (
                "Sem responsável"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="none">
              <span className="text-muted-foreground">Sem responsável</span>
            </SelectItem>
            {responsaveis.map((resp) => (
              <SelectItem key={resp} value={resp}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {resp.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {resp}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Columns3 className="h-4 w-4" />
          Status
        </label>
        <div className="h-10 px-3 flex items-center rounded-md border bg-muted/30">
          <Badge variant="outline" className="capitalize">
            {status || "Pendente"}
          </Badge>
        </div>
      </div>

      {/* Data Início */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          Data Início
        </label>
        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-10",
                !startDate && "text-muted-foreground"
              )}
            >
              {parsedStartDate
                ? format(parsedStartDate, "dd MMM yyyy", { locale: ptBR })
                : "Definir data início"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parsedStartDate}
              onSelect={(date) => {
                onStartDateChange(date || null);
                setStartDateOpen(false);
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
            {startDate && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => {
                    onStartDateChange(null);
                    setStartDateOpen(false);
                  }}
                >
                  Remover data
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Data Entrega */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Flag className="h-4 w-4" />
          Data Entrega
        </label>
        <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-10 gap-2",
                !dueDate && "text-muted-foreground",
                isOverdue && "border-destructive text-destructive",
                isDueToday && "border-warning text-warning"
              )}
            >
              {parsedDueDate ? (
                <>
                  {format(parsedDueDate, "dd MMM yyyy", { locale: ptBR })}
                  {dueBadge && (
                    <Badge variant={dueBadge.variant} className="ml-auto text-xs">
                      {dueBadge.label}
                    </Badge>
                  )}
                </>
              ) : (
                "Definir prazo"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parsedDueDate}
              onSelect={(date) => {
                onDueDateChange(date || null);
                setDueDateOpen(false);
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
            {dueDate && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => {
                    onDueDateChange(null);
                    setDueDateOpen(false);
                  }}
                >
                  Remover prazo
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
