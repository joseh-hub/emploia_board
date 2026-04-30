import { ChevronRight, Home, Users, Building2, Briefcase, ListChecks, Folder } from "lucide-react";
import { WikiFolder } from "@/hooks/useWikiFolders";
import { cn } from "@/lib/utils";

interface WikiBreadcrumbProps {
  path: WikiFolder[];
  onNavigate: (folder: WikiFolder | null) => void;
}

function getFolderIcon(folderType: string) {
  const iconClass = "h-3.5 w-3.5";

  switch (folderType) {
    case "clients":
      return <Users className={cn(iconClass, "text-clickup-purple")} />;
    case "client":
      return <Building2 className={cn(iconClass, "text-success")} />;
    case "project":
      return <Briefcase className={cn(iconClass, "text-warning")} />;
    case "tasks":
      return <ListChecks className={cn(iconClass, "text-clickup-orange")} />;
    default:
      return <Folder className={cn(iconClass, "text-muted-foreground")} />;
  }
}

export function WikiBreadcrumb({ path, onNavigate }: WikiBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1.5 hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
      >
        <Home className="h-4 w-4" />
        <span>Wiki</span>
      </button>

      {path.map((folder, index) => (
        <div key={folder.id} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={() => onNavigate(folder)}
            className={cn(
              "flex items-center gap-1.5 hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted",
              index === path.length - 1 && "text-foreground font-medium bg-muted"
            )}
          >
            {getFolderIcon(folder.folder_type)}
            <span>{folder.name}</span>
          </button>
        </div>
      ))}
    </nav>
  );
}
