import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Folder,
  FileText,
  FileImage,
  File,
  MoreVertical,
  Trash2,
  Pencil,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Move,
} from "lucide-react";
import { WikiFolder } from "@/hooks/useWikiFolders";
import { WikiFile } from "@/hooks/useWikiFiles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortColumn = "name" | "type" | "size" | "date";
type SortDirection = "asc" | "desc";

interface WikiFileListProps {
  subfolders: WikiFolder[];
  files: WikiFile[];
  onOpenFolder: (folder: WikiFolder) => void;
  onOpenFile: (file: WikiFile) => void;
  onDeleteFile?: (file: WikiFile) => void;
  onRenameFile?: (file: WikiFile) => void;
  onMoveFile?: (file: WikiFile) => void;
  selectedItemId?: string | null;
  onSelectItem?: (id: string | null) => void;
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case "markdown":
      return <FileText className="h-5 w-5 text-primary" />;
    case "pdf":
      return <File className="h-5 w-5 text-destructive" />;
    case "docx":
      return <File className="h-5 w-5 text-info" />;
    case "xlsx":
      return <File className="h-5 w-5 text-success" />;
    case "image":
      return <FileImage className="h-5 w-5 text-clickup-purple" />;
    default:
      return <File className="h-5 w-5 text-muted-foreground" />;
  }
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function WikiFileList({
  subfolders,
  files,
  onOpenFolder,
  onOpenFile,
  onDeleteFile,
  onRenameFile,
  onMoveFile,
  selectedItemId,
  onSelectItem,
}: WikiFileListProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedFiles = useMemo(() => {
    const sorted = [...files];
    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "type":
          comparison = a.file_type.localeCompare(b.file_type);
          break;
        case "size":
          comparison = (a.size_bytes || 0) - (b.size_bytes || 0);
          break;
        case "date":
          comparison =
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [files, sortColumn, sortDirection]);

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  if (subfolders.length === 0 && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Folder className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Pasta vazia</p>
        <p className="text-sm">
          Crie uma pasta ou arquivo, ou faça upload de um documento.
        </p>
      </div>
    );
  }

  const handleRowClick = (id: string) => {
    onSelectItem?.(selectedItemId === id ? null : id);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50%]">
            <button
              className="flex items-center hover:text-foreground transition-colors"
              onClick={() => handleSort("name")}
            >
              Nome
              <SortIcon column="name" />
            </button>
          </TableHead>
          <TableHead>
            <button
              className="flex items-center hover:text-foreground transition-colors"
              onClick={() => handleSort("type")}
            >
              Tipo
              <SortIcon column="type" />
            </button>
          </TableHead>
          <TableHead>
            <button
              className="flex items-center hover:text-foreground transition-colors"
              onClick={() => handleSort("size")}
            >
              Tamanho
              <SortIcon column="size" />
            </button>
          </TableHead>
          <TableHead>
            <button
              className="flex items-center hover:text-foreground transition-colors"
              onClick={() => handleSort("date")}
            >
              Modificado
              <SortIcon column="date" />
            </button>
          </TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subfolders.map((folder) => (
          <TableRow
            key={folder.id}
            className={cn(
              "cursor-pointer transition-colors",
              selectedItemId === folder.id
                ? "bg-primary/5 hover:bg-primary/10"
                : "hover:bg-muted/50"
            )}
            onClick={() => handleRowClick(folder.id)}
            onDoubleClick={() => onOpenFolder(folder)}
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-primary" />
                <span>{folder.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">Pasta</TableCell>
            <TableCell className="text-muted-foreground">-</TableCell>
            <TableCell className="text-muted-foreground">
              {format(new Date(folder.updated_at), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        ))}

        {sortedFiles.map((file) => (
          <TableRow
            key={file.id}
            className={cn(
              "cursor-pointer transition-colors group",
              selectedItemId === file.id
                ? "bg-primary/5 hover:bg-primary/10"
                : "hover:bg-muted/50"
            )}
            onClick={() => handleRowClick(file.id)}
            onDoubleClick={() => onOpenFile(file)}
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {getFileIcon(file.file_type)}
                <span>{file.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground uppercase text-xs">
              {file.file_type}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatFileSize(file.size_bytes)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {format(new Date(file.updated_at), "dd/MM/yyyy HH:mm", {
                locale: ptBR,
              })}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onRenameFile && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRenameFile(file);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Renomear
                    </DropdownMenuItem>
                  )}
                  {onMoveFile && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveFile(file);
                      }}
                    >
                      <Move className="h-4 w-4 mr-2" />
                      Mover
                    </DropdownMenuItem>
                  )}
                  {onDeleteFile && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
