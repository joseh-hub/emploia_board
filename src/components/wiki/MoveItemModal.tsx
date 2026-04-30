import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WikiFolder } from "@/hooks/useWikiFolders";
import { ChevronRight, ChevronDown, Folder, FolderOpen, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MoveItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (targetFolderId: string | null) => void;
  folders: WikiFolder[];
  currentFolderId: string;
  itemName: string;
  isLoading?: boolean;
}

interface FolderTreeItemProps {
  folder: WikiFolder;
  level: number;
  selectedFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  currentFolderId: string;
  expandedFolders: Set<string>;
  onToggleExpand: (folderId: string) => void;
}

function FolderTreeItem({
  folder,
  level,
  selectedFolderId,
  onSelect,
  currentFolderId,
  expandedFolders,
  onToggleExpand,
}: FolderTreeItemProps) {
  const isExpanded = expandedFolders.has(folder.id);
  const isSelected = selectedFolderId === folder.id;
  const isDisabled = folder.id === currentFolderId;
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <Collapsible open={isExpanded} onOpenChange={() => onToggleExpand(folder.id)}>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors",
            isSelected
              ? "bg-primary/10 text-primary font-medium"
              : isDisabled
              ? "text-muted-foreground opacity-50 cursor-not-allowed"
              : "hover:bg-muted cursor-pointer"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => !isDisabled && onSelect(folder.id)}
        >
          {hasChildren ? (
            <CollapsibleTrigger
              className="p-0.5 hover:bg-muted rounded"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(folder.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
          ) : (
            <span className="w-4" />
          )}

          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
          )}

          <span className="truncate">{folder.name}</span>
          {isDisabled && <span className="text-xs ml-auto">(atual)</span>}
        </div>

        {hasChildren && (
          <CollapsibleContent>
            {folder.children!.map((child) => (
              <FolderTreeItem
                key={child.id}
                folder={child}
                level={level + 1}
                selectedFolderId={selectedFolderId}
                onSelect={onSelect}
                currentFolderId={currentFolderId}
                expandedFolders={expandedFolders}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

export function MoveItemModal({
  open,
  onOpenChange,
  onConfirm,
  folders,
  currentFolderId,
  itemName,
  isLoading,
}: MoveItemModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
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

  const handleConfirm = () => {
    onConfirm(selectedFolderId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Krona_One']">Mover "{itemName}"</DialogTitle>
          <DialogDescription>
            Selecione a pasta de destino para mover este item.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-auto border rounded-md p-2">
          {/* Root option */}
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer",
              selectedFolderId === null
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted"
            )}
            onClick={() => setSelectedFolderId(null)}
          >
            <Home className="h-4 w-4" />
            <span>Raiz (sem pasta pai)</span>
          </div>

          <div className="mt-2">
            {folders.map((folder) => (
              <FolderTreeItem
                key={folder.id}
                folder={folder}
                level={0}
                selectedFolderId={selectedFolderId}
                onSelect={setSelectedFolderId}
                currentFolderId={currentFolderId}
                expandedFolders={expandedFolders}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className="bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0">
            {isLoading ? "Movendo..." : "Mover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
