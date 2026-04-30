import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  CalendarDays,
  FolderKanban,
  ChevronRight,
  Flag,
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
  X,
} from "lucide-react";
import { format, isToday, isPast, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Profile } from "@/hooks/useProfiles";
import { UserMultiSelect } from "@/components/layout/UserMultiSelect";

interface TaskPropertySidebarProps {
  status: string | null;
  assignedUser: string | null;
  assignedUsers?: string[];
  startDate: string | null;
  dueDate: string | null;
  projectName?: string;
  projectId?: string;
  onGoToProject?: (projectId: string) => void;
  profiles: Profile[];
  priority?: string | null;
  onStatusChange: (status: string) => void;
  onAssigneeChange: (assignee: string) => void;
  onAssigneesChange?: (assignees: string[]) => void;
  onStartDateChange: (date: Date | null) => void;
  onDueDateChange: (date: Date | null) => void;
  onPriorityChange?: (priority: string) => void;
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente", color: "bg-muted text-muted-foreground" },
  { value: "em_progresso", label: "Em Progresso", color: "bg-info/20 text-info" },
  { value: "concluido", label: "Concluído", color: "bg-success/20 text-success" },
];

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgente", icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-500/10" },
  { value: "high", label: "Alta", icon: ArrowUp, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { value: "medium", label: "Média", icon: Minus, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { value: "low", label: "Baixa", icon: ArrowDown, color: "text-green-500", bgColor: "bg-green-500/10" },
];

export function TaskPropertySidebar({
  status,
  assignedUser,
  assignedUsers = [],
  startDate,
  dueDate,
  projectName,
  projectId,
  onGoToProject,
  profiles,
  priority,
  onStatusChange,
  onAssigneeChange,
  onAssigneesChange,
  onStartDateChange,
  onDueDateChange,
  onPriorityChange,
}: TaskPropertySidebarProps) {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [assigneesOpen, setAssigneesOpen] = useState(false);

  const parsedStartDate = startDate ? new Date(startDate) : undefined;
  const parsedDueDate = dueDate ? new Date(dueDate) : undefined;

  const isOverdue = parsedDueDate && isPast(parsedDueDate) && !isToday(parsedDueDate);
  const isDueToday = parsedDueDate && isToday(parsedDueDate);
  const isDueTomorrow = parsedDueDate && isTomorrow(parsedDueDate);

  // Get effective assigned users (retrocompatibility)
  const effectiveAssignees = assignedUsers.length > 0 
    ? assignedUsers 
    : assignedUser 
      ? [assignedUser] 
      : [];

  // Get profiles for assigned users
  const assignedProfiles = effectiveAssignees
    .map(userId => profiles.find(p => p.id === userId || p.full_name === userId || p.email === userId))
    .filter(Boolean) as Profile[];

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
  const currentPriority = PRIORITY_OPTIONS.find((p) => p.value === priority) || PRIORITY_OPTIONS[2];

  const handleAssigneesChange = (userIds: string[]) => {
    if (onAssigneesChange) {
      onAssigneesChange(userIds);
    } else if (userIds.length > 0) {
      // Fallback to single assignee for retrocompatibility
      onAssigneeChange(userIds[0]);
    } else {
      onAssigneeChange("none");
    }
  };

  return (
    <div className="space-y-1">
      {/* Section Header */}
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 px-1 pb-2">
        Propriedades
      </div>

      {/* Priority */}
      {onPriorityChange && (
        <PropertyRow icon={Flag} label="Prioridade">
          <Select value={priority || "medium"} onValueChange={onPriorityChange}>
            <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-zinc-800/50 focus:ring-0 justify-start gap-2 px-2 -mx-2 text-zinc-200">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <currentPriority.icon className={cn("h-4 w-4", currentPriority.color)} />
                  <span className={cn("text-sm font-medium", currentPriority.color)}>
                    {currentPriority.label}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {PRIORITY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", opt.color)} />
                      <span className={opt.color}>{opt.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </PropertyRow>
      )}

      {/* Assignees - Multi-select */}
      <PropertyRow icon={Users} label="Responsáveis">
        <Popover open={assigneesOpen} onOpenChange={setAssigneesOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto min-h-8 px-2 -mx-2 justify-start gap-2 font-normal w-full text-zinc-200"
            >
              {assignedProfiles.length > 0 ? (
                <div className="flex items-center gap-1 flex-wrap">
                  {assignedProfiles.slice(0, 3).map((profile) => {
                    const initials = (profile.full_name || profile.email || "U")
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <Avatar key={profile.id} className="h-5 w-5 -ml-1 first:ml-0">
                        <AvatarFallback className="text-[10px] bg-[#3F1757]/40 text-[#CBC5EA]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {assignedProfiles.length > 3 && (
                    <span className="text-xs text-zinc-400 ml-1">
                      +{assignedProfiles.length - 3}
                    </span>
                  )}
                  {assignedProfiles.length === 1 && (
                    <span className="text-sm truncate ml-1">
                      {assignedProfiles[0].full_name || assignedProfiles[0].email?.split("@")[0]}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-zinc-500 text-sm border-b border-dotted border-zinc-600 hover:text-zinc-300 cursor-pointer">
                  Não atribuído
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 bg-zinc-900 border-zinc-800" align="start">
            <UserMultiSelect
              selectedUsers={effectiveAssignees.filter(u => profiles.some(p => p.id === u))}
              onSelectionChange={handleAssigneesChange}
            />
          </PopoverContent>
        </Popover>
      </PropertyRow>

      {/* Separator */}
      <div className="py-2">
        <div className="h-px bg-zinc-800" />
      </div>

      {/* Start Date */}
      <PropertyRow icon={CalendarDays} label="Início">
        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2 -mx-2 justify-start gap-2 font-normal w-full",
                !startDate
                  ? "text-zinc-500 border-b border-dotted border-zinc-600 rounded-none hover:text-zinc-300 hover:border-zinc-500"
                  : "text-zinc-200"
              )}
            >
              {parsedStartDate
                ? format(parsedStartDate, "dd MMM yyyy", { locale: ptBR })
                : "Não definido"}
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
                  Remover
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </PropertyRow>

      {/* Due Date */}
      <PropertyRow icon={Flag} label="Entrega">
        <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2 -mx-2 justify-start gap-2 font-normal w-full",
                !dueDate &&
                  "text-zinc-500 border-b border-dotted border-zinc-600 rounded-none hover:text-zinc-300 hover:border-zinc-500",
                dueDate && "text-zinc-200",
                isOverdue && "text-destructive",
                isDueToday && "text-amber-400"
              )}
            >
              <span className="flex items-center gap-2">
                {parsedDueDate
                  ? format(parsedDueDate, "dd MMM yyyy", { locale: ptBR })
                  : "Não definido"}
                {isOverdue && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    Atrasado
                  </Badge>
                )}
                {isDueToday && (
                  <Badge className="text-[10px] px-1.5 py-0 bg-warning/20 text-warning">
                    Hoje
                  </Badge>
                )}
                {isDueTomorrow && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Amanhã
                  </Badge>
                )}
              </span>
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
                  Remover
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </PropertyRow>

      {/* Separator */}
      <div className="py-2">
        <div className="h-px bg-zinc-800" />
      </div>

      {/* Project */}
      {projectName && (
        <PropertyRow
          icon={FolderKanban}
          label="Projeto"
          onClick={projectId && onGoToProject ? () => onGoToProject(projectId) : undefined}
        >
          <div className="flex items-center gap-2 px-2 -mx-2 h-8">
            <Badge variant="outline" className="font-medium border-zinc-700 text-zinc-200">
              {projectName}
            </Badge>
          </div>
        </PropertyRow>
      )}
    </div>
  );
}

function PropertyRow({
  icon: Icon,
  label,
  children,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const baseClassName = "flex items-center py-1.5 rounded-md transition-colors w-full";
  const interactiveClassName = onClick ? "hover:bg-zinc-800/50 group cursor-pointer" : "cursor-default";
  const content = (
    <>
      <div className="flex items-center gap-2 text-zinc-400 w-24 shrink-0 px-1">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      {onClick && (
        <ChevronRight className="h-3.5 w-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(baseClassName, interactiveClassName, "text-left")}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
        aria-label={label}
      >
        {content}
      </button>
    );
  }
  return <div className={cn(baseClassName, interactiveClassName)} role="presentation">{content}</div>;
}
