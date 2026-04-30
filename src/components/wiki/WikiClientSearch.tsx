import { useState, useMemo } from "react";
import { Search, X, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WikiFolder } from "@/hooks/useWikiFolders";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WikiClientSearchProps {
  clientFolders: WikiFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folder: WikiFolder) => void;
  expandedFolders: Set<string>;
  onToggleExpand: (folderId: string) => void;
}

export function WikiClientSearch({
  clientFolders,
  selectedFolderId,
  onSelectFolder,
  expandedFolders,
  onToggleExpand,
}: WikiClientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clientFolders;
    const query = searchQuery.toLowerCase();
    return clientFolders.filter((folder) =>
      folder.name.toLowerCase().includes(query)
    );
  }, [clientFolders, searchQuery]);

  return (
    <div className="space-y-1">
      {/* Search input */}
      <div className="px-2 pb-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filtrar clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 pr-7 text-xs"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Client list */}
      <ScrollArea className="max-h-[200px]">
        {filteredClients.length === 0 ? (
          <p className="px-4 py-2 text-xs text-muted-foreground">
            {searchQuery ? "Nenhum cliente encontrado" : "Sem clientes"}
          </p>
        ) : (
          filteredClients.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder)}
              className={cn(
                "flex items-center gap-2 w-full px-4 py-1.5 text-sm transition-colors",
                selectedFolderId === folder.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <Building2 className="h-4 w-4 text-success shrink-0" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
