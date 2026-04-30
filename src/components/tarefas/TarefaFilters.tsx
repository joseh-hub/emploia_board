import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Filter, X } from "lucide-react";
import { useProjetos } from "@/hooks/useProjetos";
import { useProfiles } from "@/hooks/useProfiles";
import { useTarefaTags } from "@/hooks/useTarefaTags";
import { TarefaFilters as TarefaFiltersType } from "@/hooks/useTarefas";

interface TarefaFiltersProps {
  filters: TarefaFiltersType;
  onFiltersChange: (filters: TarefaFiltersType) => void;
}

export function TarefaFilters({ filters, onFiltersChange }: TarefaFiltersProps) {
  const { data: projetos } = useProjetos();
  const { data: profiles } = useProfiles();
  const { data: tags } = useTarefaTags();

  const activeFilterCount = [
    filters.projetoId,
    filters.responsavel,
    filters.status,
    filters.tagId,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      search: filters.search,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tarefas..."
          value={filters.search || ""}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9 h-9"
        />
      </div>

      {/* Filters Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 bg-popover">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filtros</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>

            {/* Projeto Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Projeto</label>
              <Select
                value={filters.projetoId || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    projetoId: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os projetos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os projetos</SelectItem>
                  {projetos?.map((projeto) => (
                    <SelectItem key={projeto.project_id} value={projeto.project_id}>
                      {projeto.company_name || "Sem nome"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Responsável Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Responsável</label>
              <Select
                value={filters.responsavel || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    responsavel: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os responsáveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os responsáveis</SelectItem>
                  {profiles?.map((profile) => {
                    const name = profile.full_name || profile.email?.split("@")[0] || "Usuário";
                    const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
                    return (
                      <SelectItem key={profile.id} value={profile.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          {name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    status: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_progresso">Em Progresso</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tag Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tag</label>
              <Select
                value={filters.tagId || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    tagId: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as tags</SelectItem>
                  {tags?.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
