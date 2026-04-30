import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LayoutGrid, Table2, SlidersHorizontal, Plus } from "lucide-react";
import { useTarefas, Tarefa, TarefaFilters } from "@/hooks/useTarefas";
import { useTarefaBoardColumns } from "@/hooks/useTarefaBoardColumns";
import { useBoardSettings, useUpdateBoardSettings } from "@/hooks/useBoardSettings";
import { TopBar } from "@/components/layout/TopBar";
import { TasksFilterBar } from "@/components/tarefas/page/TasksFilterBar";
import { TasksEmptyState } from "@/components/tarefas/page/TasksEmptyState";
import { TaskKanbanBoard } from "@/components/tarefas/board/TaskKanbanBoard";
import { TaskTableView } from "@/components/tarefas/table/TaskTableView";
import { TarefaDetailModal } from "@/components/tarefas/TarefaDetailModal";
import { CreatePrioritizedTaskModal } from "@/components/tarefas/modals/CreatePrioritizedTaskModal";
import { BoardSettingsButton } from "@/components/shared/BoardSettingsButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function Tarefas() {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [filters, setFilters] = useState<TarefaFilters>({});
  const [selectedTarefaId, setSelectedTarefaId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Abrir tarefa via navegação de notificação
  useEffect(() => {
    const state = location.state as { openTarefaId?: string } | null;
    if (state?.openTarefaId) {
      setSelectedTarefaId(state.openTarefaId);
      setDetailModalOpen(true);
      // Limpar state para não reabrir no próximo render
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const { data: tarefas = [], isLoading } = useTarefas(filters);
  const { data: columns = [] } = useTarefaBoardColumns();
  const { data: boardSettings, isLoading: settingsLoading } = useBoardSettings("tarefas");
  const updateSettings = useUpdateBoardSettings();

  const hideOverdueColumns = boardSettings?.hide_overdue_columns || [];

  const handleSaveSettings = async (columnIds: string[]) => {
    await updateSettings.mutateAsync({
      boardType: "tarefas",
      hideOverdueColumns: columnIds,
    });
  };

  // Derivar tarefa selecionada da lista atualizada - garante sincronização com cache
  const selectedTarefa = useMemo(() => {
    if (!selectedTarefaId) return null;
    return tarefas.find((t) => t.id === selectedTarefaId) || null;
  }, [tarefas, selectedTarefaId]);

  const handleTarefaClick = (tarefa: Tarefa) => {
    setSelectedTarefaId(tarefa.id);
    setDetailModalOpen(true);
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.projetoId ||
      filters.responsavel ||
      filters.status ||
      filters.tagId ||
      filters.search
    );
  }, [filters]);

  const clearFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = 
    (filters.projetoId ? 1 : 0) + 
    (filters.responsavel ? 1 : 0) + 
    (filters.status ? 1 : 0) + 
    (filters.tagId ? 1 : 0);

  return (
    <div className="flex flex-col h-full">
      {/* TopBar with global actions - Premium Zinc (alinhado a Projetos/Clientes) */}
      <TopBar 
        title="Tarefas Priorizadas" 
        variant="premiumZinc"
        showSearch
        searchValue={filters.search || ""}
        onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
        searchPlaceholder="Buscar tarefas..."
      >
        <div className="flex items-center gap-3">
          {/* Nova Tarefa */}
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="h-9 gap-2 px-4 font-['Lexend_Deca'] text-sm font-medium bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </Button>

          {/* Filters Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 h-9 text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 bg-[#3F1757]/20 text-[#CBC5EA] border border-[#3F1757]/30 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className={cn("w-80 border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl p-4")} align="end" sideOffset={8}>
              <TasksFilterBar filters={filters} onFiltersChange={setFilters} />
            </PopoverContent>
          </Popover>

          {/* View Toggle */}
          <div className="flex items-center gap-0.5 rounded-md bg-zinc-900/40 p-0.5 border border-zinc-800/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("board")}
              className={cn(
                "gap-1.5 h-8 px-2.5 rounded-sm transition-colors",
                viewMode === "board" 
                  ? "bg-zinc-800 text-white shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden xl:inline text-xs font-medium">Board</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "gap-1.5 h-8 px-2.5 rounded-sm transition-colors",
                viewMode === "list" 
                  ? "bg-zinc-800 text-white shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Table2 className="h-3.5 w-3.5" />
              <span className="hidden xl:inline text-xs font-medium">Tabela</span>
            </Button>
          </div>

          {/* Settings Button */}
          <BoardSettingsButton
            columns={columns}
            hideOverdueColumns={hideOverdueColumns}
            onSave={handleSaveSettings}
            isLoading={settingsLoading}
          />
        </div>
      </TopBar>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden p-4 lg:p-6 bg-zinc-950/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-transparent" />
              <span className="text-sm text-zinc-500">
                Carregando tarefas...
              </span>
            </div>
          </div>
        ) : tarefas.length === 0 ? (
          <TasksEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={hasActiveFilters ? clearFilters : undefined}
          />
        ) : viewMode === "board" ? (
          <TaskKanbanBoard 
            tarefas={tarefas} 
            onTarefaClick={handleTarefaClick}
            hideOverdueColumns={hideOverdueColumns}
          />
        ) : (
          <div className="h-full overflow-auto">
            <TaskTableView tarefas={tarefas} onTarefaClick={handleTarefaClick} />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <TarefaDetailModal
        tarefa={selectedTarefa}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      {/* Create Prioritized Task Modal */}
      <CreatePrioritizedTaskModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={(tarefaId) => {
          setSelectedTarefaId(tarefaId);
          setDetailModalOpen(true);
        }}
      />
    </div>
  );
}
