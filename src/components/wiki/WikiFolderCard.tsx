import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Folder,
  FolderOpen,
  Users,
  Building2,
  Briefcase,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WikiFolder } from "@/hooks/useWikiFolders";
import { Card } from "@/components/ui/card";

interface WikiFolderCardProps {
  folder: WikiFolder;
  onClick: () => void;
  fileCount?: number;
  subfolderCount?: number;
}

function getFolderIcon(folderType: string) {
  const iconClass = "h-8 w-8";

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
      return <FolderOpen className={cn(iconClass, "text-info")} />;
    default:
      return <Folder className={cn(iconClass, "text-muted-foreground")} />;
  }
}

function getFolderColor(folderType: string) {
  switch (folderType) {
    case "clients":
      return "bg-clickup-purple/5 hover:bg-clickup-purple/10 border-clickup-purple/20";
    case "client":
      return "bg-success/5 hover:bg-success/10 border-success/20";
    case "project":
      return "bg-warning/5 hover:bg-warning/10 border-warning/20";
    case "tasks":
      return "bg-clickup-orange/5 hover:bg-clickup-orange/10 border-clickup-orange/20";
    case "general":
      return "bg-info/5 hover:bg-info/10 border-info/20";
    default:
      return "bg-muted/30 hover:bg-muted/50";
  }
}

export function WikiFolderCard({
  folder,
  onClick,
  fileCount,
  subfolderCount,
}: WikiFolderCardProps) {
  const stats: string[] = [];
  if (typeof fileCount === "number" && fileCount > 0) {
    stats.push(`${fileCount} arquivo${fileCount !== 1 ? "s" : ""}`);
  }
  if (typeof subfolderCount === "number" && subfolderCount > 0) {
    stats.push(`${subfolderCount} subpasta${subfolderCount !== 1 ? "s" : ""}`);
  }

  const updatedAt = folder.updated_at
    ? formatDistanceToNow(new Date(folder.updated_at), {
        addSuffix: true,
        locale: ptBR,
      })
    : null;

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        getFolderColor(folder.folder_type)
      )}
      onClick={onClick}
    >
      <div className="flex flex-col gap-2">
        {/* Icon */}
        <div className="flex items-center justify-center py-2">
          {getFolderIcon(folder.folder_type)}
        </div>

        {/* Name */}
        <h4 className="font-medium text-sm text-center truncate" title={folder.name}>
          {folder.name}
        </h4>

        {/* Stats */}
        {stats.length > 0 && (
          <p className="text-xs text-muted-foreground text-center truncate">
            {stats.join(" · ")}
          </p>
        )}

        {/* Updated */}
        {updatedAt && (
          <p className="text-[10px] text-muted-foreground/70 text-center">
            {updatedAt}
          </p>
        )}
      </div>
    </Card>
  );
}
