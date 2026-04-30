import { WikiFolder } from "@/hooks/useWikiFolders";
import { WikiFile } from "@/hooks/useWikiFiles";
import { WikiFolderCard } from "./WikiFolderCard";
import { WikiFileCard } from "./WikiFileCard";

interface WikiCardGridProps {
  subfolders: WikiFolder[];
  files: WikiFile[];
  onOpenFolder: (folder: WikiFolder) => void;
  onOpenFile: (file: WikiFile) => void;
  onDeleteFile?: (file: WikiFile) => void;
  onRenameFile?: (file: WikiFile) => void;
  onMoveFile?: (file: WikiFile) => void;
  selectedItemId?: string | null;
  onSelectItem?: (id: string | null) => void;
  folderFileCounts?: Map<string, number>;
  folderSubfolderCounts?: Map<string, number>;
}

export function WikiCardGrid({
  subfolders,
  files,
  onOpenFolder,
  onOpenFile,
  onDeleteFile,
  onRenameFile,
  onMoveFile,
  selectedItemId,
  onSelectItem,
  folderFileCounts,
  folderSubfolderCounts,
}: WikiCardGridProps) {
  const hasContent = subfolders.length > 0 || files.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground">
          <p className="text-sm">Esta pasta está vazia</p>
          <p className="text-xs mt-1">Crie arquivos ou subpastas para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subfolders */}
      {subfolders.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Pastas ({subfolders.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {subfolders.map((folder) => (
              <WikiFolderCard
                key={folder.id}
                folder={folder}
                onClick={() => onOpenFolder(folder)}
                fileCount={folderFileCounts?.get(folder.id)}
                subfolderCount={folderSubfolderCounts?.get(folder.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {files.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Arquivos ({files.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {files.map((file) => (
              <WikiFileCard
                key={file.id}
                file={file}
                onClick={() => onOpenFile(file)}
                onDelete={onDeleteFile}
                onRename={onRenameFile}
                onMove={onMoveFile}
                isSelected={selectedItemId === file.id}
                onSelect={onSelectItem}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
