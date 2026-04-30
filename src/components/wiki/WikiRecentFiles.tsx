import { FileText, FileImage, FileType, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { WikiFile } from "@/hooks/useWikiFiles";

interface WikiRecentFilesProps {
  recentFiles: WikiFile[];
  onOpenFile: (file: WikiFile) => void;
  selectedFileId?: string | null;
}

function getFileIcon(fileType: string) {
  const iconClass = "h-4 w-4 shrink-0";
  
  switch (fileType) {
    case "markdown":
      return <FileText className={cn(iconClass, "text-primary")} />;
    case "pdf":
      return <FileType className={cn(iconClass, "text-destructive")} />;
    case "image":
      return <FileImage className={cn(iconClass, "text-clickup-purple")} />;
    default:
      return <File className={cn(iconClass, "text-muted-foreground")} />;
  }
}

export function WikiRecentFiles({
  recentFiles,
  onOpenFile,
  selectedFileId,
}: WikiRecentFilesProps) {
  if (recentFiles.length === 0) {
    return (
      <p className="px-4 py-2 text-xs text-muted-foreground">
        Nenhum arquivo recente
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {recentFiles.slice(0, 8).map((file) => (
        <button
          key={file.id}
          onClick={() => onOpenFile(file)}
          className={cn(
            "flex items-center gap-2 w-full px-4 py-1.5 text-sm transition-colors",
            selectedFileId === file.id
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-muted text-foreground"
          )}
        >
          {getFileIcon(file.file_type)}
          <span className="truncate">{file.name}</span>
        </button>
      ))}
    </div>
  );
}
