import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText,
  FileImage,
  FileType,
  File,
  MoreVertical,
  Pencil,
  Trash2,
  FolderInput,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WikiFile } from "@/hooks/useWikiFiles";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WikiFileCardProps {
  file: WikiFile;
  onClick: () => void;
  onDelete?: (file: WikiFile) => void;
  onRename?: (file: WikiFile) => void;
  onMove?: (file: WikiFile) => void;
  isSelected?: boolean;
  onSelect?: (id: string | null) => void;
}

function getFileIcon(fileType: string) {
  const iconClass = "h-8 w-8";

  switch (fileType) {
    case "markdown":
      return <FileText className={cn(iconClass, "text-primary")} />;
    case "pdf":
      return <FileType className={cn(iconClass, "text-destructive")} />;
    case "image":
      return <FileImage className={cn(iconClass, "text-clickup-purple")} />;
    case "docx":
    case "doc":
      return <FileType className={cn(iconClass, "text-info")} />;
    case "xlsx":
    case "xls":
      return <FileType className={cn(iconClass, "text-success")} />;
    default:
      return <File className={cn(iconClass, "text-muted-foreground")} />;
  }
}

function getFileColor(fileType: string) {
  switch (fileType) {
    case "markdown":
      return "border-primary/20 hover:border-primary/40";
    case "pdf":
      return "border-destructive/20 hover:border-destructive/40";
    case "image":
      return "border-clickup-purple/20 hover:border-clickup-purple/40";
    case "docx":
    case "doc":
      return "border-info/20 hover:border-info/40";
    case "xlsx":
    case "xls":
      return "border-success/20 hover:border-success/40";
    default:
      return "";
  }
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getContentPreview(content: string | null): string {
  if (!content) return "";
  // Remove markdown formatting and get first 80 chars
  const plain = content
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n/g, " ")
    .trim();
  return plain.length > 80 ? `${plain.slice(0, 80)}...` : plain;
}

export function WikiFileCard({
  file,
  onClick,
  onDelete,
  onRename,
  onMove,
  isSelected,
  onSelect,
}: WikiFileCardProps) {
  const updatedAt = file.updated_at
    ? formatDistanceToNow(new Date(file.updated_at), {
        addSuffix: true,
        locale: ptBR,
      })
    : null;

  const preview = getContentPreview(file.content);
  const size = formatFileSize(file.size_bytes);
  const hasActions = onDelete || onRename || onMove;

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md relative group",
        getFileColor(file.file_type),
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      {/* Actions menu */}
      {hasActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="absolute top-2 right-2 p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onRename && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(file);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Renomear
              </DropdownMenuItem>
            )}
            {onMove && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(file);
                }}
              >
                <FolderInput className="h-4 w-4 mr-2" />
                Mover
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="flex flex-col gap-2">
        {/* Icon */}
        <div className="flex items-center justify-center py-2">
          {getFileIcon(file.file_type)}
        </div>

        {/* Name */}
        <h4 className="font-medium text-sm text-center truncate" title={file.name}>
          {file.name}
        </h4>

        {/* Preview */}
        {preview && (
          <p className="text-xs text-muted-foreground text-center line-clamp-2 min-h-[2.5rem]">
            {preview}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/70">
          {updatedAt && <span>{updatedAt}</span>}
          {updatedAt && size && <span>·</span>}
          {size && <span>{size}</span>}
        </div>
      </div>
    </Card>
  );
}
