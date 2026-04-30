import { useState, useMemo } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  Users,
  Building2,
  Briefcase,
  ListChecks,
  Lock,
  FolderPlus,
  FilePlus,
  Pencil,
  Trash2,
  MoreVertical,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WikiFolder } from "@/hooks/useWikiFolders";
import { WikiFile } from "@/hooks/useWikiFiles";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WikiSidebarSection } from "./WikiSidebarSection";
import { WikiClientSearch } from "./WikiClientSearch";
import { WikiRecentFiles } from "./WikiRecentFiles";

// Icon mapping by folder_type
function getFolderIcon(folderType: string, isExpanded: boolean) {
  const iconClass = "h-4 w-4 shrink-0";

  switch (folderType) {
    case "clients":
      return <Users className={cn(iconClass, "text-clickup-purple")} />;
    case "client":
      return <Building2 className={cn(iconClass, "text-success")} />;
    case "project":
      return <Briefcase className={cn(iconClass, "text-warning")} />;
    case "tasks":
      return <ListChecks className={cn(iconClass, "text-clickup-orange")} />;
    case "general":
      return isExpanded ? (
        <FolderOpen className={cn(iconClass, "text-info")} />
      ) : (
        <Folder className={cn(iconClass, "text-info")} />
      );
    case "manual":
    default:
      return isExpanded ? (
        <FolderOpen className={cn(iconClass, "text-muted-foreground")} />
      ) : (
        <Folder className={cn(iconClass, "text-muted-foreground")} />
      );
  }
}

function isAutoFolder(folderType: string) {
  return ["clients", "client", "project", "tasks"].includes(folderType);
}

interface WikiFolderItemProps {
  folder: WikiFolder;
  level: number;
  selectedFolderId: string | null;
  onSelectFolder: (folder: WikiFolder) => void;
  expandedFolders: Set<string>;
  onToggleExpand: (folderId: string) => void;
  fileCount?: number;
  onNewSubfolder?: (parentId: string) => void;
  onNewFile?: (folderId: string) => void;
  onRenameFolder?: (folder: WikiFolder) => void;
  onDeleteFolder?: (folder: WikiFolder) => void;
}

function WikiFolderItem({
  folder,
  level,
  selectedFolderId,
  onSelectFolder,
  expandedFolders,
  onToggleExpand,
  fileCount,
  onNewSubfolder,
  onNewFile,
  onRenameFolder,
  onDeleteFolder,
}: WikiFolderItemProps) {
  const isExpanded = expandedFolders.has(folder.id);
  const isSelected = selectedFolderId === folder.id;
  const hasChildren = folder.children && folder.children.length > 0;
  const isAuto = isAutoFolder(folder.folder_type);
  const canDelete = folder.folder_type === "manual";

  const folderContent = (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors group",
        isSelected
          ? "bg-primary/10 text-primary font-medium"
          : "hover:bg-muted text-foreground"
      )}
      style={{ paddingLeft: `${level * 12 + 8}px` }}
      onClick={() => onSelectFolder(folder)}
    >
      {hasChildren ? (
        <CollapsibleTrigger
          className="p-0.5 hover:bg-muted/80 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(folder.id);
          }}
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-90"
            )}
          />
        </CollapsibleTrigger>
      ) : (
        <span className="w-4" />
      )}

      {getFolderIcon(folder.folder_type, isExpanded)}

      <span className="truncate flex-1">{folder.name}</span>

      {isAuto && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Lock className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Pasta criada automaticamente pelo sistema</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {typeof fileCount === "number" && fileCount > 0 && (
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {fileCount}
        </span>
      )}

      {/* Visible action menu for manual folders */}
      {canDelete && (onRenameFolder || onDeleteFolder) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-0.5 rounded hover:bg-muted/80 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onRenameFolder && (
              <DropdownMenuItem onClick={() => onRenameFolder(folder)}>
                <Pencil className="h-4 w-4 mr-2" />
                Renomear
              </DropdownMenuItem>
            )}
            {onDeleteFolder && (
              <DropdownMenuItem
                onClick={() => onDeleteFolder(folder)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  return (
    <div>
      <Collapsible open={isExpanded}>
        <ContextMenu>
          <ContextMenuTrigger asChild>{folderContent}</ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            {onNewSubfolder && (
              <ContextMenuItem onClick={() => onNewSubfolder(folder.id)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Nova Subpasta
              </ContextMenuItem>
            )}
            {onNewFile && (
              <ContextMenuItem onClick={() => onNewFile(folder.id)}>
                <FilePlus className="h-4 w-4 mr-2" />
                Novo Arquivo
              </ContextMenuItem>
            )}
            {(onNewSubfolder || onNewFile) &&
              (onRenameFolder || onDeleteFolder) && <ContextMenuSeparator />}
            {onRenameFolder && !isAuto && (
              <ContextMenuItem onClick={() => onRenameFolder(folder)}>
                <Pencil className="h-4 w-4 mr-2" />
                Renomear
              </ContextMenuItem>
            )}
            {onDeleteFolder && canDelete && (
              <ContextMenuItem
                onClick={() => onDeleteFolder(folder)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>

        {hasChildren && (
          <CollapsibleContent>
            {folder.children!.map((child) => (
              <WikiFolderItem
                key={child.id}
                folder={child}
                level={level + 1}
                selectedFolderId={selectedFolderId}
                onSelectFolder={onSelectFolder}
                expandedFolders={expandedFolders}
                onToggleExpand={onToggleExpand}
                onNewSubfolder={onNewSubfolder}
                onNewFile={onNewFile}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

interface WikiSidebarProps {
  folders: WikiFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folder: WikiFolder) => void;
  onNewSubfolder?: (parentId: string) => void;
  onNewFile?: (folderId: string) => void;
  onRenameFolder?: (folder: WikiFolder) => void;
  onDeleteFolder?: (folder: WikiFolder) => void;
  recentFiles?: WikiFile[];
  onOpenRecentFile?: (file: WikiFile) => void;
  selectedFileId?: string | null;
}

export function WikiSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onNewSubfolder,
  onNewFile,
  onRenameFolder,
  onDeleteFolder,
  recentFiles = [],
  onOpenRecentFile,
  selectedFileId,
}: WikiSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    // Start with root folders expanded
    const initial = new Set<string>();
    folders.forEach((f) => initial.add(f.id));
    return initial;
  });

  const handleToggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Separate folders into "Clientes" and "Geral"
  const { clientsFolders, generalFolders, clientFolder } = useMemo(() => {
    // Find the "Clientes" root folder
    const clientFolder = folders.find(
      (f) => f.folder_type === "clients" || f.name.toLowerCase() === "clientes"
    );

    // Client folders are children of "Clientes" folder
    const clientsFolders = clientFolder?.children || [];

    // General folders are everything except "Clientes"
    const generalFolders = folders.filter(
      (f) => f.folder_type !== "clients" && f.name.toLowerCase() !== "clientes"
    );

    return { clientsFolders, generalFolders, clientFolder };
  }, [folders]);

  if (folders.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center text-muted-foreground">
        <p className="text-sm">Nenhuma pasta ainda. Crie sua primeira pasta.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto py-2">
      {/* Recentes Section */}
      {recentFiles.length > 0 && onOpenRecentFile && (
        <WikiSidebarSection
          title="Recentes"
          icon={<Clock className="h-3 w-3" />}
          defaultOpen={true}
        >
          <WikiRecentFiles
            recentFiles={recentFiles}
            onOpenFile={onOpenRecentFile}
            selectedFileId={selectedFileId}
          />
        </WikiSidebarSection>
      )}

      {/* Clientes Section with Search */}
      {clientsFolders.length > 0 && (
        <WikiSidebarSection
          title="Clientes"
          icon={<Users className="h-3 w-3 text-clickup-purple" />}
          defaultOpen={true}
          badge={clientsFolders.length}
        >
          <WikiClientSearch
            clientFolders={clientsFolders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            expandedFolders={expandedFolders}
            onToggleExpand={handleToggleExpand}
          />
        </WikiSidebarSection>
      )}

      {/* Geral Section */}
      {generalFolders.length > 0 && (
        <WikiSidebarSection
          title="Geral"
          icon={<Folder className="h-3 w-3 text-info" />}
          defaultOpen={true}
        >
          {generalFolders.map((folder) => (
            <WikiFolderItem
              key={folder.id}
              folder={folder}
              level={0}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              expandedFolders={expandedFolders}
              onToggleExpand={handleToggleExpand}
              onNewSubfolder={onNewSubfolder}
              onNewFile={onNewFile}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </WikiSidebarSection>
      )}
    </div>
  );
}
