import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useProjetos } from "@/hooks/useProjetos";
import { useProfiles } from "@/hooks/useProfiles";
import { useTarefaTags } from "@/hooks/useTarefaTags";
import { TarefaFilters } from "@/hooks/useTarefas";
import { Separator } from "@/components/ui/separator";

interface TasksFilterBarProps {
  filters: TarefaFilters;
  onFiltersChange: (filters: TarefaFilters) => void;
}

export function TasksFilterBar({ filters, onFiltersChange }: TasksFilterBarProps) {
  const { data: projetos } = useProjetos();
  const { data: profiles } = useProfiles();
  const { data: tags } = useTarefaTags();

  const activeFiltersCount =
    (filters.projetoId ? 1 : 0) +
    (filters.responsavel ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.tagId ? 1 : 0);

  const clearAllFilters = () => {
    onFiltersChange({ search: filters.search });
  };

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-zinc-100">Filtros Avançados</h4>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-auto p-0 text-zinc-500 hover:text-zinc-200"
          >
            <X className="mr-1 h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      <Separator className="bg-zinc-800/50" />

      <div className="space-y-4">
        {/* Projeto */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Projeto</label>
          <Select
            value={filters.projetoId || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                projetoId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800 text-zinc-200 hover:bg-zinc-800 focus:ring-0">
              <SelectValue placeholder="Selecione o projeto" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
              <SelectItem value="all" className="focus:bg-zinc-900">Todos os projetos</SelectItem>
              {projetos?.map((projeto) => (
                <SelectItem key={projeto.project_id} value={projeto.project_id} className="focus:bg-zinc-900">
                  {projeto.company_name || "Sem nome"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Responsável */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Responsável</label>
          <Select
            value={filters.responsavel || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                responsavel: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800 text-zinc-200 hover:bg-zinc-800 focus:ring-0">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
              <SelectItem value="all" className="focus:bg-zinc-900">Todos</SelectItem>
              {profiles?.map((profile) => {
                const name = profile.full_name || profile.email?.split("@")[0] || "Usuário";
                const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
                return (
                  <SelectItem key={profile.id} value={profile.id} className="focus:bg-zinc-900">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-[8px] bg-zinc-800 text-zinc-300">
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

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800 text-zinc-200 hover:bg-zinc-800 focus:ring-0">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
              <SelectItem value="all" className="focus:bg-zinc-900">Todos os status</SelectItem>
              <SelectItem value="pendente" className="focus:bg-zinc-900">Pendente</SelectItem>
              <SelectItem value="em_progresso" className="focus:bg-zinc-900">Em Progresso</SelectItem>
              <SelectItem value="concluido" className="focus:bg-zinc-900">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tag</label>
          <Select
            value={filters.tagId || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                tagId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800 text-zinc-200 hover:bg-zinc-800 focus:ring-0">
              <SelectValue placeholder="Selecione a tag" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
              <SelectItem value="all" className="focus:bg-zinc-900">Todas as tags</SelectItem>
              {tags?.map((tag) => (
                <SelectItem key={tag.id} value={tag.id} className="focus:bg-zinc-900">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
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
    </div>
  );
}
