import { useState } from "react";
import { LayoutGrid, List, SlidersHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopBar } from "@/components/layout/TopBar";
import { useClientes, useResponsaveis, ClienteFilters, Cliente } from "@/hooks/useClientes";
import { ClientesTable } from "@/components/clientes/ClientesTable";
import { ClienteFiltersBar } from "@/components/clientes/ClienteFilters";
import { ClienteDetailModal } from "@/components/clientes/ClienteDetailModal";
import { KanbanBoard } from "@/components/clientes/board/KanbanBoard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { premiumZinc } from "@/styles/premium-zinc";
import { cn } from "@/lib/utils";

export default function Clientes() {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [filters, setFilters] = useState<ClienteFilters>({});
  
  // Modal states
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: clientes, isLoading } = useClientes(filters);
  const { data: responsaveis } = useResponsaveis();

  const handleView = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setDetailOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Clientes"
        showSearch
        searchValue={filters.search || ""}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar clientes..."
        variant="premiumZinc"
      >
        <div className="flex items-center gap-2">
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
              </Button>
            </PopoverTrigger>
            <PopoverContent className={cn("w-80", premiumZinc.popoverContent)} align="end" sideOffset={8}>
              <ClienteFiltersBar
                filters={filters}
                onFiltersChange={setFilters}
                responsaveis={responsaveis || []}
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
              <List className="h-3.5 w-3.5" />
              <span className="hidden xl:inline text-xs font-medium">Lista</span>
            </Button>
          </div>
        </div>
      </TopBar>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden p-4 lg:p-6">
        {viewMode === "board" ? (
          <KanbanBoard
            clientes={clientes || []}
            isLoading={isLoading}
            onViewCliente={handleView}
          />
        ) : (
          <div className="h-full overflow-auto">
            <ClientesTable
              clientes={clientes || []}
              isLoading={isLoading}
              onView={handleView}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <ClienteDetailModal
        cliente={selectedCliente}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
