import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Lock,
  Pencil,
  MoreHorizontal,
  Trash2,
  Users,
  Globe,
  LayoutGrid,
  List,
  Filter,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteBoard, CustomBoard as CustomBoardType } from "@/hooks/useCustomBoards";
import { EditBoardModal } from "@/components/layout/EditBoardModal";
import { CustomBoardKanban } from "@/components/custom-board/CustomBoardKanban";
import { CustomBoardCardModal } from "@/components/custom-board/CustomBoardCardModal";
import { BoardSettingsModal } from "@/components/custom-board/BoardSettingsModal";
import { CustomBoardCard } from "@/hooks/useCustomBoardCards";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";

const PRIORITIES = [
  { value: "urgent", label: "Urgente", color: "bg-red-500" },
  { value: "high", label: "Alta", color: "bg-orange-500" },
  { value: "medium", label: "Média", color: "bg-blue-500" },
  { value: "low", label: "Baixa", color: "bg-green-500" },
];

export default function CustomBoard() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const deleteBoard = useDeleteBoard();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CustomBoardCard | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{ priority: string[]; assignedUsers: string[] }>({
    priority: [],
    assignedUsers: [],
  });
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  const { data: board, isLoading, error } = useQuery({
    queryKey: ["custom-board", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_boards")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as CustomBoardType | null;
    },
    enabled: !!slug,
  });

  const isOwner = user?.id === board?.created_by;

  const handleDelete = async () => {
    if (!board) return;
    await deleteBoard.mutateAsync(board.id);
    navigate("/");
  };

  const getVisibilityIcon = () => {
    switch (board?.visibility) {
      case "private":
        return <Lock className="h-3.5 w-3.5" />;
      case "specific":
        return <Users className="h-3.5 w-3.5" />;
      default:
        return <Globe className="h-3.5 w-3.5" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (board?.visibility) {
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
    setFilters({ ...filters, priority: newPriorities });
  };

  const clearFilters = () => {
    setFilters({ priority: [], assignedUsers: [] });
  };

  const hasActiveFilters = filters.priority.length > 0 || filters.assignedUsers.length > 0;

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-72 h-[400px] rounded-xl flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Board não encontrado</h1>
          <p className="text-muted-foreground">
            Este board não existe ou você não tem permissão para acessá-lo.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* TopBar with global actions - Premium Zinc */}
      <TopBar
        title={board.name}
        variant="premiumZinc"
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar cards..."
      >
        <div className="flex items-center gap-3">
          {/* Visibility badge */}
          <Badge variant="outline" className="gap-1 text-zinc-400 border-zinc-700 bg-zinc-900/80">
            {getVisibilityIcon()}
            {getVisibilityLabel()}
          </Badge>

          {/* Filters Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-9 text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-colors">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 bg-[#3F1757]/20 text-[#CBC5EA] border border-[#3F1757]/30 flex items-center justify-center">
                    {filters.priority.length + filters.assignedUsers.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl p-4" align="end" sideOffset={8}>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-400 mb-2">Prioridade</p>
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority.value}
                    onClick={() => handlePriorityToggle(priority.value)}
                    className={cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 rounded-sm text-sm transition-colors",
                      filters.priority.includes(priority.value)
                        ? "bg-zinc-800 text-zinc-100"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", priority.color)} />
                    {priority.label}
                  </button>
                ))}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-sm text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors mt-2 border-t border-zinc-800 pt-2"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 rounded-md bg-zinc-900/40 p-0.5 border border-zinc-800/50">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1.5 h-8 px-2.5 rounded-sm transition-colors",
                viewMode === "kanban" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden xl:inline text-xs font-medium">Board</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1.5 h-8 px-2.5 rounded-sm transition-colors",
                viewMode === "list" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden xl:inline text-xs font-medium">Lista</span>
            </Button>
          </div>

          {/* Settings button - available to all users */}
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
            onClick={() => setSettingsModalOpen(true)}
            title="Configurações do board"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Owner actions */}
          {isOwner && (
            <>
              <Button variant="ghost" size="sm" className="gap-2 h-9 text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-colors" onClick={() => setEditModalOpen(true)}>
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir board
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </TopBar>

      {/* Board content - alinhado ao baseline Tarefas (sem bg sólido; depende do bg-background do AppLayout) */}
      <div className="flex-1 min-h-0 overflow-hidden p-4 lg:p-6">
        {viewMode === "kanban" ? (
          <CustomBoardKanban
            boardId={board.id}
            searchQuery={searchQuery}
            filters={filters}
            hideOverdueColumns={board.hide_overdue_columns || []}
            onViewCard={(card) => setSelectedCard(card)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            Visualização em lista em breve
          </div>
        )}
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <CustomBoardCardModal
          card={selectedCard}
          boardId={board.id}
          boardName={board.name}
          open={!!selectedCard}
          onOpenChange={(open) => !open && setSelectedCard(null)}
        />
      )}

      {/* Settings Modal */}
      {settingsModalOpen && board && (
        <BoardSettingsModal
          board={board}
          open={settingsModalOpen}
          onOpenChange={setSettingsModalOpen}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && board && (
        <EditBoardModal
          board={board}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir board</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o board "{board.name}"? Esta ação não
              pode ser desfeita e todos os cards serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBoard.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
