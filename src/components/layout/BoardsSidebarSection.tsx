import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  FolderKanban,
  CheckSquare,
  ChevronRight,
  Plus,
  Kanban,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { CreateBoardModal } from "./CreateBoardModal";
import { useCustomBoards } from "@/hooks/useCustomBoards";

const STORAGE_KEY = "sidebar-boards-open";

// Fixed/static boards that already exist
const staticBoards = [
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Projetos", url: "/projetos", icon: FolderKanban },
  { title: "Tarefas", url: "/tarefas", icon: CheckSquare },
];

export function BoardsSidebarSection() {
  const location = useLocation();

  // Persist open state in localStorage
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch custom boards from database
  const { data: customBoards, isLoading } = useCustomBoards();

  // Save open state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isOpen));
  }, [isOpen]);

  // Check if current route is a board route
  const isBoardRoute =
    staticBoards.some((board) => location.pathname.startsWith(board.url)) ||
    location.pathname.startsWith("/boards/");

  // Auto-expand if on a board route
  useEffect(() => {
    if (isBoardRoute && !isOpen) {
      setIsOpen(true);
    }
  }, [location.pathname, isBoardRoute, isOpen]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Boards"
                  onClick={() => setIsOpen(!isOpen)}
                  className={cn(
                    "group rounded-xl transition-all duration-200 h-9 px-3 border border-transparent hover:border-white/5",
                    isBoardRoute
                      ? "bg-transparent text-white font-medium"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                      isBoardRoute
                        ? "border-transparent bg-[#3F1757] text-[#CBC5EA]"
                        : "border-transparent text-white/40 group-hover:text-white/80"
                    )}
                  >
                    <Kanban className="h-4 w-4" />
                  </span>
                  <span className="text-sm">Boards</span>
                  <ChevronRight
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                      isOpen && "rotate-90"
                    )}
                  />
                </SidebarMenuButton>

                <CollapsibleContent className="transition-all duration-200">
                  <SidebarMenuSub className="ml-3 mt-0.5 border-l border-sidebar-border/50 pl-2.5 py-0.5 space-y-0.5">
                    {/* Static Boards */}
                    {staticBoards.map((board) => {
                      const active = isActive(board.url);
                      const BoardIcon = board.icon;
                      return (
                        <SidebarMenuSubItem key={board.url}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={active}
                            className={cn(
                              "group/sub h-8 rounded-lg px-2.5 transition-all duration-200 border border-transparent hover:border-white/5",
                              active
                                ? "bg-transparent text-white font-medium"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <NavLink to={board.url} className="flex items-center gap-2.5">
                              <span
                                className={cn(
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] transition-colors",
                                  active
                                    ? "border-transparent bg-[#3F1757] text-[#CBC5EA]"
                                    : "border-transparent text-white/40 group-hover/sub:text-white/80"
                                )}
                              >
                                <BoardIcon className="h-3 w-3" />
                              </span>
                              <span className="text-sm truncate">{board.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}

                    {/* Loading state */}
                    {isLoading && (
                      <SidebarMenuSubItem>
                        <div className="flex items-center gap-2 px-2.5 py-1.5 text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span className="text-xs">Carregando...</span>
                        </div>
                      </SidebarMenuSubItem>
                    )}

                    {/* Custom Boards */}
                    {customBoards?.map((board) => {
                      const boardUrl = `/boards/${board.slug}`;
                      const active = isActive(boardUrl);
                      return (
                        <SidebarMenuSubItem key={board.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={active}
                            className={cn(
                              "group/sub h-8 rounded-lg px-2.5 transition-all duration-200 border border-transparent hover:border-white/5",
                              active
                                ? "bg-transparent text-white font-medium"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <NavLink to={boardUrl} className="flex items-center gap-2.5">
                              <span
                                className={cn(
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                                  active
                                    ? "border-transparent bg-[#3F1757] text-[#CBC5EA]"
                                    : "border-transparent text-white/40 group-hover/sub:text-white/80"
                                )}
                              >
                                <Kanban className="h-3 w-3" />
                              </span>
                              <span className="text-sm truncate max-w-[140px]">
                                {board.name}
                              </span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}

                    {/* Create New Board Button */}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() => setCreateModalOpen(true)}
                        className="h-8 rounded-lg px-2.5 text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground cursor-pointer transition-all duration-200 border border-dashed border-sidebar-border/50 hover:border-primary/30"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-sidebar-border/40 bg-sidebar/40">
                          <Plus className="h-3 w-3" />
                        </span>
                        <span className="text-sm">Criar novo board</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {createModalOpen && (
        <CreateBoardModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      )}
    </>
  );
}
