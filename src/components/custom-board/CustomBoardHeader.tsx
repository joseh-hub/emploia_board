import { useState } from "react";
import { CustomBoard } from "@/hooks/useCustomBoards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  Lock,
  Users,
  Globe,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomBoardHeaderProps {
  board: CustomBoard;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    priority: string[];
    assignedUsers: string[];
  };
  onFiltersChange: (filters: { priority: string[]; assignedUsers: string[] }) => void;
  viewMode: "kanban" | "list";
  onViewModeChange: (mode: "kanban" | "list") => void;
}

const PRIORITIES = [
  { value: "urgent", label: "Urgente", color: "bg-red-500" },
  { value: "high", label: "Alta", color: "bg-orange-500" },
  { value: "medium", label: "Média", color: "bg-blue-500" },
  { value: "low", label: "Baixa", color: "bg-green-500" },
];

export function CustomBoardHeader({
  board,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
}: CustomBoardHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  const getVisibilityIcon = () => {
    switch (board.visibility) {
      case "private":
        return <Lock className="h-3.5 w-3.5" />;
      case "specific":
        return <Users className="h-3.5 w-3.5" />;
      default:
        return <Globe className="h-3.5 w-3.5" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (board.visibility) {
      case "private":
        return "Privado";
      case "specific":
        return "Usuários específicos";
      default:
        return "Todos";
    }
  };

  const handlePriorityToggle = (priority: string) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    onFiltersChange({ ...filters, priority: newPriorities });
  };

  const clearFilters = () => {
    onFiltersChange({ priority: [], assignedUsers: [] });
  };

  const hasActiveFilters = filters.priority.length > 0 || filters.assignedUsers.length > 0;

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">{board.name}</h1>
        </div>
        
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          {getVisibilityIcon()}
          {getVisibilityLabel()}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className={cn(
          "relative transition-all duration-200",
          searchFocused ? "w-64" : "w-48"
        )}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Buscar cards..."
            className="pl-9 h-9"
          />
        </div>

        {/* Filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                  {filters.priority.length + filters.assignedUsers.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover">
            <DropdownMenuLabel>Prioridade</DropdownMenuLabel>
            {PRIORITIES.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority.value}
                checked={filters.priority.includes(priority.value)}
                onCheckedChange={() => handlePriorityToggle(priority.value)}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", priority.color)} />
                  {priority.label}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
            
            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters}>
                  Limpar filtros
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View toggle */}
        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === "kanban" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-none"
            onClick={() => onViewModeChange("kanban")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-none"
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
