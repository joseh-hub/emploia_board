import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Check, Trash2 } from "lucide-react";
import {
  useTarefaTags,
  useCreateTarefaTag,
  useDeleteTarefaTag,
  useAssignTag,
  useUnassignTag,
  TarefaTag,
} from "@/hooks/useTarefaTags";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
  { name: "Vermelho", hex: "#ef4444" },
  { name: "Laranja", hex: "#f97316" },
  { name: "Amarelo", hex: "#eab308" },
  { name: "Verde", hex: "#22c55e" },
  { name: "Azul", hex: "#3b82f6" },
  { name: "Roxo", hex: "#8b5cf6" },
  { name: "Rosa", hex: "#ec4899" },
  { name: "Cinza", hex: "#71717a" },
];

interface TagSelectorProps {
  tarefaId: string;
  assignedTagIds: string[];
  onClose?: () => void;
}

export function TagSelector({ tarefaId, assignedTagIds, onClose }: TagSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[4].hex);
  const [tagToDelete, setTagToDelete] = useState<TarefaTag | null>(null);

  const { data: tags = [] } = useTarefaTags();
  const createTag = useCreateTarefaTag();
  const deleteTag = useDeleteTarefaTag();
  const assignTag = useAssignTag();
  const unassignTag = useUnassignTag();

  const handleToggleTag = (tag: TarefaTag) => {
    const isAssigned = assignedTagIds.includes(tag.id);
    
    if (isAssigned) {
      unassignTag.mutate({ tarefaId, tagId: tag.id });
    } else {
      assignTag.mutate({ tarefaId, tagId: tag.id });
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    await createTag.mutateAsync({
      name: newTagName.trim(),
      color: selectedColor,
    });

    setNewTagName("");
    setIsCreating(false);
  };

  const handleDeleteTag = () => {
    if (!tagToDelete) return;
    deleteTag.mutate(tagToDelete.id);
    setTagToDelete(null);
  };

  return (
    <div className="space-y-3">
      <ScrollArea className="max-h-48">
        <div className="space-y-1">
          {tags.map((tag) => {
            const isAssigned = assignedTagIds.includes(tag.id);
            return (
              <div
                key={tag.id}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors group"
                onClick={() => handleToggleTag(tag)}
              >
                <Checkbox checked={isAssigned} className="pointer-events-none" />
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-sm flex-1 truncate">{tag.name}</span>
                {isAssigned && <Check className="h-4 w-4 text-primary" />}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTagToDelete(tag);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}

          {tags.length === 0 && !isCreating && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhuma tag disponível
            </p>
          )}
        </div>
      </ScrollArea>

      {isCreating ? (
        <div className="space-y-3 border-t pt-3">
          <Input
            placeholder="Nome da tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateTag();
              if (e.key === "Escape") setIsCreating(false);
            }}
          />
          
          <div className="flex flex-wrap gap-1.5">
            {TAG_COLORS.map((color) => (
              <button
                key={color.hex}
                type="button"
                className={cn(
                  "w-6 h-6 rounded-full transition-all",
                  selectedColor === color.hex && "ring-2 ring-offset-2 ring-primary"
                )}
                style={{ backgroundColor: color.hex }}
                onClick={() => setSelectedColor(color.hex)}
                title={color.name}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || createTag.isPending}
              className="flex-1"
            >
              Criar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreating(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="h-4 w-4" />
          Nova tag
        </Button>
      )}

      <AlertDialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tag</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tag "{tagToDelete?.name}"? Esta ação removerá a tag de todas as tarefas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTag} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
