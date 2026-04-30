import { useState, useMemo, useEffect } from "react";
import {
  FolderPlus,
  FilePlus,
  Upload,
  Loader2,
  Search,
  X,
  FileText,
  ChevronRight,
  Users,
  FolderOpen,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { supabase } from "@/integrations/supabase/client";
import {
  useWikiFolderTree,
  useWikiFolderPath,
  WikiFolder,
  useCreateWikiFolder,
  useWikiFolders,
  useUpdateWikiFolder,
  useDeleteWikiFolder,
} from "@/hooks/useWikiFolders";
import {
  useWikiFiles,
  useCreateWikiFile,
  useDeleteWikiFile,
  WikiFile,
  useSearchWikiFiles,
  useRenameWikiFile,
  useMoveWikiFile,
} from "@/hooks/useWikiFiles";
import { useWikiUpload } from "@/hooks/useWikiUpload";
import { useWikiRecentFiles } from "@/hooks/useWikiRecentFiles";
import { WikiSidebar } from "@/components/wiki/WikiSidebar";
import { WikiBreadcrumb } from "@/components/wiki/WikiBreadcrumb";
import { WikiCardGrid } from "@/components/wiki/WikiCardGrid";
import { WikiTabs, WikiTabValue } from "@/components/wiki/WikiTabs";
import { WikiFileViewer } from "@/components/wiki/WikiFileViewer";
import { WikiEmptyState } from "@/components/wiki/WikiEmptyState";
import { WikiDeleteConfirmModal } from "@/components/wiki/WikiDeleteConfirmModal";
import { CreateFolderModal } from "@/components/wiki/CreateFolderModal";
import { CreateFileModal } from "@/components/wiki/CreateFileModal";
import { UploadFileModal } from "@/components/wiki/UploadFileModal";
import { RenameFolderModal } from "@/components/wiki/RenameFolderModal";
import { RenameFileModal } from "@/components/wiki/RenameFileModal";
import { MoveItemModal } from "@/components/wiki/MoveItemModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export default function Wiki() {
  const [searchParams, setSearchParams] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      file: params.get("file"),
      folder: params.get("folder"),
    };
  });
  const [selectedFolder, setSelectedFolder] = useState<WikiFolder | null>(null);
  const [selectedFile, setSelectedFile] = useState<WikiFile | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateFile, setShowCreateFile] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<WikiTabValue>("clientes");

  // Delete modals
  const [deleteFileTarget, setDeleteFileTarget] = useState<WikiFile | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<WikiFolder | null>(null);

  // Rename modals
  const [renameFolderTarget, setRenameFolderTarget] = useState<WikiFolder | null>(null);
  const [renameFileTarget, setRenameFileTarget] = useState<WikiFile | null>(null);

  // Move modals
  const [moveFileTarget, setMoveFileTarget] = useState<WikiFile | null>(null);

  // Context menu parent folder
  const [contextParentId, setContextParentId] = useState<string | null>(null);

  const { tree, isLoading: foldersLoading, data: allFolders } = useWikiFolderTree();
  const { data: files = [], isLoading: filesLoading } = useWikiFiles(
    selectedFolder?.id || null
  );
  const folderPath = useWikiFolderPath(selectedFolder?.id || null);
  const { data: searchResults = [], isLoading: searchLoading } =
    useSearchWikiFiles(searchQuery);
  const { recentFiles, addRecentFile } = useWikiRecentFiles();

  const createFolder = useCreateWikiFolder();
  const createFile = useCreateWikiFile();
  const deleteFile = useDeleteWikiFile();
  const uploadFile = useWikiUpload();
  const updateFolder = useUpdateWikiFolder();
  const deleteFolder = useDeleteWikiFolder();
  const renameFile = useRenameWikiFile();
  const moveFile = useMoveWikiFile();

  // Build folder path map for search results
  const folderPathMap = useMemo(() => {
    if (!allFolders) return new Map<string, string>();

    const map = new Map<string, string>();

    const buildPath = (folderId: string): string => {
      const folder = allFolders.find((f) => f.id === folderId);
      if (!folder) return "";

      const parentPath = folder.parent_id ? buildPath(folder.parent_id) : "";
      return parentPath ? `${parentPath} > ${folder.name}` : folder.name;
    };

    allFolders.forEach((folder) => {
      map.set(folder.id, buildPath(folder.id));
    });

    return map;
  }, [allFolders]);

  // Calculate folder counts
  const { folderFileCounts, folderSubfolderCounts } = useMemo(() => {
    if (!allFolders) return { folderFileCounts: new Map(), folderSubfolderCounts: new Map() };

    const fileCounts = new Map<string, number>();
    const subfolderCounts = new Map<string, number>();

    allFolders.forEach((folder) => {
      const childCount = allFolders.filter((f) => f.parent_id === folder.id).length;
      subfolderCounts.set(folder.id, childCount);
    });

    return { folderFileCounts: fileCounts, folderSubfolderCounts: subfolderCounts };
  }, [allFolders]);

  // Handle URL params on mount
  useEffect(() => {
    if (searchParams.folder && allFolders) {
      const folder = allFolders.find((f) => f.id === searchParams.folder);
      if (folder) {
        setSelectedFolder(folder);
      }
    }
    if (searchParams.file && searchParams.folder) {
      supabase
        .from("wiki_files")
        .select("*")
        .eq("id", searchParams.file)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setSelectedFile(data as WikiFile);
            addRecentFile(data.id);
          }
        });
      window.history.replaceState({}, "", "/wiki");
    }
  }, [searchParams, allFolders, addRecentFile]);

  // Get subfolders of selected folder
  const subfolders = useMemo(() => {
    if (!allFolders || !selectedFolder) return [];
    return allFolders.filter((f) => f.parent_id === selectedFolder.id);
  }, [allFolders, selectedFolder]);

  // Determine if current folder is in "clientes" or "geral" context
  const isClientContext = useMemo(() => {
    if (!selectedFolder || !allFolders) return false;

    // Check if any ancestor is the "Clientes" folder
    let currentId: string | null = selectedFolder.id;
    while (currentId) {
      const folder = allFolders.find((f) => f.id === currentId);
      if (!folder) break;
      if (folder.folder_type === "clients" || folder.name.toLowerCase() === "clientes") {
        return true;
      }
      currentId = folder.parent_id;
    }
    return false;
  }, [selectedFolder, allFolders]);

  // Sync tab with folder context
  useEffect(() => {
    if (selectedFolder) {
      setActiveTab(isClientContext ? "clientes" : "geral");
    }
  }, [selectedFolder, isClientContext]);

  const handleSelectFolder = (folder: WikiFolder) => {
    setSelectedFolder(folder);
    setSelectedFile(null);
    setSelectedItemId(null);
  };

  const handleNavigate = (folder: WikiFolder | null) => {
    setSelectedFolder(folder);
    setSelectedFile(null);
    setSelectedItemId(null);
  };

  const handleOpenFile = (file: WikiFile) => {
    setSelectedFile(file);
    addRecentFile(file.id);
  };

  const handleOpenRecentFile = (file: WikiFile) => {
    // Find and select the folder
    if (allFolders) {
      const folder = allFolders.find((f) => f.id === file.folder_id);
      if (folder) {
        setSelectedFolder(folder);
      }
    }
    setSelectedFile(file);
    addRecentFile(file.id);
  };

  // Create folder - supports root creation
  const handleCreateFolder = (name: string) => {
    const parentId = contextParentId !== null ? contextParentId : selectedFolder?.id || null;
    createFolder.mutate(
      { name, parentId },
      {
        onSuccess: () => {
          setShowCreateFolder(false);
          setContextParentId(null);
        },
      }
    );
  };

  // Open create folder modal from context menu
  const handleNewSubfolder = (parentId: string) => {
    setContextParentId(parentId);
    setShowCreateFolder(true);
  };

  // Open create file modal from context menu
  const handleNewFileFromContext = (folderId: string) => {
    const folder = allFolders?.find((f) => f.id === folderId);
    if (folder) {
      setSelectedFolder(folder);
      setShowCreateFile(true);
    }
  };

  const handleCreateFile = (name: string) => {
    if (!selectedFolder) return;
    createFile.mutate(
      { folderId: selectedFolder.id, name },
      {
        onSuccess: (file) => {
          setShowCreateFile(false);
          setSelectedFile(file as WikiFile);
          addRecentFile((file as WikiFile).id);
        },
      }
    );
  };

  const handleUpload = (file: File) => {
    if (!selectedFolder) return;
    uploadFile.mutate(
      { folderId: selectedFolder.id, file },
      {
        onSuccess: () => setShowUpload(false),
      }
    );
  };

  // Delete handlers with confirmation
  const handleDeleteFileRequest = (file: WikiFile) => {
    setDeleteFileTarget(file);
  };

  const handleConfirmDeleteFile = () => {
    if (deleteFileTarget) {
      deleteFile.mutate(deleteFileTarget, {
        onSuccess: () => setDeleteFileTarget(null),
      });
    }
  };

  const handleDeleteFolderRequest = (folder: WikiFolder) => {
    setDeleteFolderTarget(folder);
  };

  const handleConfirmDeleteFolder = () => {
    if (deleteFolderTarget) {
      deleteFolder.mutate(deleteFolderTarget.id, {
        onSuccess: () => {
          setDeleteFolderTarget(null);
          if (selectedFolder?.id === deleteFolderTarget.id) {
            setSelectedFolder(null);
          }
        },
      });
    }
  };

  // Rename handlers
  const handleRenameFolder = (folder: WikiFolder) => {
    setRenameFolderTarget(folder);
  };

  const handleConfirmRenameFolder = (name: string) => {
    if (renameFolderTarget) {
      updateFolder.mutate(
        { id: renameFolderTarget.id, name },
        {
          onSuccess: () => setRenameFolderTarget(null),
        }
      );
    }
  };

  const handleRenameFile = (file: WikiFile) => {
    setRenameFileTarget(file);
  };

  const handleConfirmRenameFile = (name: string) => {
    if (renameFileTarget) {
      renameFile.mutate(
        { id: renameFileTarget.id, name },
        {
          onSuccess: () => setRenameFileTarget(null),
        }
      );
    }
  };

  // Move handlers
  const handleMoveFileRequest = (file: WikiFile) => {
    setMoveFileTarget(file);
  };

  const handleConfirmMoveFile = (targetFolderId: string | null) => {
    if (moveFileTarget && targetFolderId) {
      moveFile.mutate(
        {
          id: moveFileTarget.id,
          newFolderId: targetFolderId,
          oldFolderId: moveFileTarget.folder_id,
        },
        {
          onSuccess: () => setMoveFileTarget(null),
        }
      );
    }
  };

  const handleOpenSearchResult = (result: { id: string; folder_id: string }) => {
    const folder = allFolders?.find((f) => f.id === result.folder_id);
    if (folder) {
      setSelectedFolder(folder);
    }
    supabase
      .from("wiki_files")
      .select("*")
      .eq("id", result.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSelectedFile(data as WikiFile);
          addRecentFile(data.id);
          setSearchQuery("");
        }
      });
  };

  if (foldersLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* TopBar with global actions */}
      <TopBar title="Wiki">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar arquivos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Search Results Dropdown */}
          {searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-80 overflow-auto">
              {searchLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Buscando...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhum resultado encontrado
                </div>
              ) : (
                <div className="py-1">
                  {searchResults.map((result) => {
                    const path = folderPathMap.get(result.folder_id) || "";
                    return (
                      <button
                        key={result.id}
                        className="w-full px-4 py-2 text-left hover:bg-accent"
                        onClick={() => handleOpenSearchResult(result)}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-medium truncate">{result.name}</span>
                        </div>
                        {path && (
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground ml-6">
                            {path.split(" > ").map((segment, i, arr) => (
                              <span key={i} className="flex items-center gap-1">
                                {segment}
                                {i < arr.length - 1 && <ChevronRight className="h-3 w-3" />}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setContextParentId(null);
                  setShowCreateFolder(true);
                }}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Nova Pasta
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {selectedFolder
                ? `Criar subpasta em "${selectedFolder.name}"`
                : "Criar pasta na raiz"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateFile(true)}
                disabled={!selectedFolder}
              >
                <FilePlus className="h-4 w-4 mr-2" />
                Novo Arquivo
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {selectedFolder
                ? `Criar arquivo em "${selectedFolder.name}"`
                : "Selecione uma pasta primeiro"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={() => setShowUpload(true)} disabled={!selectedFolder}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {selectedFolder
                ? `Upload em "${selectedFolder.name}"`
                : "Selecione uma pasta primeiro"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TopBar>

      {/* Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <div className="h-full border-r bg-muted/20">
            <WikiSidebar
              folders={tree}
              selectedFolderId={selectedFolder?.id || null}
              onSelectFolder={handleSelectFolder}
              onNewSubfolder={handleNewSubfolder}
              onNewFile={handleNewFileFromContext}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolderRequest}
              recentFiles={recentFiles}
              onOpenRecentFile={handleOpenRecentFile}
              selectedFileId={selectedFile?.id}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content */}
        <ResizablePanel defaultSize={80}>
          <div className="h-full flex flex-col">
            {selectedFile ? (
              <WikiFileViewer file={selectedFile} onBack={() => setSelectedFile(null)} />
            ) : (
              <>
                {/* Tabs */}
                <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between gap-4">
                  <WikiTabs value={activeTab} onChange={setActiveTab} />

                  {/* Tab description */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {activeTab === "clientes" ? (
                      <>
                        <Users className="h-4 w-4 text-clickup-purple" />
                        <span>Documentos de clientes</span>
                      </>
                    ) : (
                      <>
                        <FolderOpen className="h-4 w-4 text-info" />
                        <span>Documentos internos</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Breadcrumb */}
                {selectedFolder && (
                  <div className="px-4 py-3 border-b">
                    <WikiBreadcrumb path={folderPath} onNavigate={handleNavigate} />
                  </div>
                )}

                {/* File Grid or Empty State */}
                <div className="flex-1 overflow-auto p-4">
                  {selectedFolder ? (
                    filesLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <WikiCardGrid
                        subfolders={subfolders}
                        files={files}
                        onOpenFolder={handleSelectFolder}
                        onOpenFile={handleOpenFile}
                        onDeleteFile={handleDeleteFileRequest}
                        onRenameFile={handleRenameFile}
                        onMoveFile={handleMoveFileRequest}
                        selectedItemId={selectedItemId}
                        onSelectItem={setSelectedItemId}
                        folderFileCounts={folderFileCounts}
                        folderSubfolderCounts={folderSubfolderCounts}
                      />
                    )
                  ) : (
                    <WikiEmptyState
                      onCreateFolder={() => {
                        setContextParentId(null);
                        setShowCreateFolder(true);
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Modals */}
      <CreateFolderModal
        open={showCreateFolder}
        onOpenChange={(open) => {
          setShowCreateFolder(open);
          if (!open) setContextParentId(null);
        }}
        onConfirm={handleCreateFolder}
        isLoading={createFolder.isPending}
      />

      <CreateFileModal
        open={showCreateFile}
        onOpenChange={setShowCreateFile}
        onConfirm={handleCreateFile}
        isLoading={createFile.isPending}
      />

      <UploadFileModal
        open={showUpload}
        onOpenChange={setShowUpload}
        onConfirm={handleUpload}
        isLoading={uploadFile.isPending}
      />

      {/* Delete File Modal */}
      <WikiDeleteConfirmModal
        open={!!deleteFileTarget}
        onOpenChange={(open) => !open && setDeleteFileTarget(null)}
        onConfirm={handleConfirmDeleteFile}
        itemName={deleteFileTarget?.name || ""}
        itemType="arquivo"
        isLoading={deleteFile.isPending}
      />

      {/* Delete Folder Modal */}
      <WikiDeleteConfirmModal
        open={!!deleteFolderTarget}
        onOpenChange={(open) => !open && setDeleteFolderTarget(null)}
        onConfirm={handleConfirmDeleteFolder}
        itemName={deleteFolderTarget?.name || ""}
        itemType="pasta"
        isLoading={deleteFolder.isPending}
      />

      {/* Rename Folder Modal */}
      <RenameFolderModal
        open={!!renameFolderTarget}
        onOpenChange={(open) => !open && setRenameFolderTarget(null)}
        onConfirm={handleConfirmRenameFolder}
        currentName={renameFolderTarget?.name || ""}
        isLoading={updateFolder.isPending}
      />

      {/* Rename File Modal */}
      <RenameFileModal
        open={!!renameFileTarget}
        onOpenChange={(open) => !open && setRenameFileTarget(null)}
        onConfirm={handleConfirmRenameFile}
        currentName={renameFileTarget?.name || ""}
        isLoading={renameFile.isPending}
      />

      {/* Move File Modal */}
      {moveFileTarget && (
        <MoveItemModal
          open={!!moveFileTarget}
          onOpenChange={(open) => !open && setMoveFileTarget(null)}
          onConfirm={handleConfirmMoveFile}
          folders={tree}
          currentFolderId={moveFileTarget.folder_id}
          itemName={moveFileTarget.name}
          isLoading={moveFile.isPending}
        />
      )}
    </div>
  );
}
