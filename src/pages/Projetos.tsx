import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, List, Filter, X, Users, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TopBar } from "@/components/layout/TopBar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useProjetos, Projeto, ProjetoFilters } from "@/hooks/useProjetos";
import { supabase } from "@/integrations/supabase/client";
import { useProfiles } from "@/hooks/useProfiles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjetoBoardColumns } from "@/hooks/useProjetoBoardColumns";
import { useBoardSettings, useUpdateBoardSettings } from "@/hooks/useBoardSettings";
import { ProjetoKanbanBoard } from "@/components/projetos/board/ProjetoKanbanBoard";
import { ProjetoDetailModal } from "@/components/projetos/ProjetoDetailModal";
import { ProjetoCard } from "@/components/projetos/ProjetoCard";
import { BoardSettingsButton } from "@/components/shared/BoardSettingsButton";
import { ProjetosOverviewTable } from "@/components/projetos/ProjetosOverviewTable";
import { ProjetoFiltersBar } from "@/components/projetos/ProjetoFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { premiumZinc } from "@/styles/premium-zinc";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "voo_solo", label: "Voo Solo" },
  { value: "ativo", label: "Ativo" },
  { value: "concluido", label: "Concluído" },
  { value: "pausado", label: "Pausado" },
];

const CLIENT_TYPE_OPTIONS = [
  { value: "Recorrente", label: "Recorrente" },
  { value: "Projeto", label: "Projeto" },
  { value: "Consultoria", label: "Consultoria" },
  { value: "Implantação", label: "Implantação" },
];

const VALUE_RANGE_OPTIONS = [
  { value: "ate_5k", label: "Até R$ 5.000" },
  { value: "5k_15k", label: "R$ 5.000 - R$ 15.000" },
  { value: "15k_50k", label: "R$ 15.000 - R$ 50.000" },
  { value: "acima_50k", label: "Acima de R$ 50.000" },
];

export interface ExtendedProjetoFilters extends ProjetoFilters {
  clientType?: string[];
  valueRange?: string[];
  responsavel?: string[];
}

export default function Projetos() {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"board" | "cards" | "overview">("board");
  const [filters, setFilters] = useState<ExtendedProjetoFilters>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: projetos, isLoading } = useProjetos(filters);

  // Abrir modal do projeto quando navegação vem da tarefa (state.openProjetoId)
  useEffect(() => {
    const openProjetoId = (location.state as { openProjetoId?: string } | null)?.openProjetoId;
    if (!openProjetoId || !projetos) return;
    const projeto = projetos.find((p) => p.project_id === openProjetoId);
    if (projeto) {
      setSelectedProjeto(projeto);
      setIsDetailOpen(true);
      navigate("/projetos", { replace: true, state: {} });
    }
  }, [location.state, projetos, navigate]);
  const { data: profiles } = useProfiles();

  // Auto-refresh projetos_overview when page mounts
  useEffect(() => {
    supabase.functions.invoke('refresh-projetos-overview').catch(() => {});
  }, []);
  const { data: columns = [] } = useProjetoBoardColumns();
  const { data: boardSettings, isLoading: settingsLoading } = useBoardSettings("projetos");
  const updateSettings = useUpdateBoardSettings();

  const hideOverdueColumns = boardSettings?.hide_overdue_columns || [];

  const handleSaveSettings = async (columnIds: string[]) => {
    await updateSettings.mutateAsync({
      boardType: "projetos",
      hideOverdueColumns: columnIds,
    });
  };

  // Apply additional client-side filters
  const filteredProjetos = projetos?.filter((p) => {
    if (filters.clientType?.length) {
      if (!filters.clientType.includes(p.client_type || "")) return false;
    }
    if (filters.valueRange?.length) {
      const value = p.monthly_value || 0;
      const matches = filters.valueRange.some((range) => {
        if (range === "ate_5k") return value <= 5000;
        if (range === "5k_15k") return value > 5000 && value <= 15000;
        if (range === "15k_50k") return value > 15000 && value <= 50000;
        if (range === "acima_50k") return value > 50000;
        return true;
      });
      if (!matches) return false;
    }
    if (filters.responsavel?.length) {
      const responsaveis = Array.isArray(p.responsavelTecnico) ? p.responsavelTecnico as string[] : [];
      const hasMatch = filters.responsavel.some(userId => responsaveis.includes(userId));
      if (!hasMatch) return false;
    }
    return true;
  });

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const activeFiltersCount =
    (filters.status?.length || 0) +
    (filters.clientType?.length || 0) +
    (filters.valueRange?.length || 0) +
    (filters.responsavel?.length || 0);

  const handleViewProjeto = (projeto: Projeto) => {
    setSelectedProjeto(projeto);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Projetos"
        showSearch
        searchValue={filters.search || ""}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar projetos..."
        variant="premiumZinc"
      >
        {/* Filters Popover */}
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 h-9 text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className={cn("ml-1 h-5 px-1.5 text-xs", premiumZinc.badgeCount)}>
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn("w-72", premiumZinc.popoverContent)} align="start">
            <ProjetoFiltersBar
              filters={filters}
              onFiltersChange={setFilters}
              profiles={profiles || undefined}
            />
          </PopoverContent>
        </Popover>

        {/* View Toggle */}
        <div className="flex items-center gap-0.5 rounded-md bg-zinc-900/40 p-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("board")}
            className={cn(
              "gap-1.5 h-8 px-2.5 rounded-sm transition-colors",
              viewMode === "board" 
                ? "bg-zinc-800/80 text-foreground shadow-sm" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Board</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("cards")}
            className={cn(
              "gap-1.5 h-8 px-2.5 rounded-sm transition-colors",
              viewMode === "cards" 
                ? "bg-zinc-800/80 text-foreground shadow-sm" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Cards</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("overview")}
            className={cn(
              "gap-1.5 h-8 px-2.5 rounded-sm transition-colors",
              viewMode === "overview" 
                ? "bg-zinc-800/80 text-foreground shadow-sm" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Visão Geral</span>
          </Button>
        </div>

        {/* Settings Button */}
        <BoardSettingsButton
          columns={columns}
          hideOverdueColumns={hideOverdueColumns}
          onSave={handleSaveSettings}
          isLoading={settingsLoading}
        />
      </TopBar>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden p-4 lg:p-6">
        {viewMode === "board" ? (
          <ProjetoKanbanBoard
            projetos={filteredProjetos || []}
            isLoading={isLoading}
            onViewProjeto={handleViewProjeto}
            hideOverdueColumns={hideOverdueColumns}
          />
        ) : viewMode === "overview" ? (
          <ProjetosOverviewTable />
        ) : (
          <div className="h-full overflow-auto">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-[220px] rounded-lg" />
                  ))
                : filteredProjetos?.map((projeto) => (
                    <ProjetoCard
                      key={projeto.project_id}
                      projeto={projeto}
                      onView={handleViewProjeto}
                    />
                  ))}
            </div>

            {!isLoading && filteredProjetos?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-zinc-500">Nenhum projeto encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ProjetoDetailModal
        projeto={selectedProjeto}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
