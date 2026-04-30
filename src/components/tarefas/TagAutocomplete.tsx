import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Plus, Check } from "lucide-react";
import {
  useTarefaTags,
  useCreateTarefaTag,
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

interface TagAutocompleteProps {
  tarefaId: string;
  assignedTags: TarefaTag[];
}

export function TagAutocomplete({ tarefaId, assignedTags }: TagAutocompleteProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[4].hex);

  const { data: allTags = [] } = useTarefaTags();
  const createTag = useCreateTarefaTag();
  const assignTag = useAssignTag();
  const unassignTag = useUnassignTag();

  const assignedTagIds = assignedTags.map((t) => t.id);

  const filteredTags = useMemo(() => {
    if (!searchValue.trim()) return allTags;
    return allTags.filter((tag) =>
      tag.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [allTags, searchValue]);

  const canCreateTag = useMemo(() => {
    if (!searchValue.trim()) return false;
    return !allTags.some(
      (tag) => tag.name.toLowerCase() === searchValue.toLowerCase()
    );
  }, [allTags, searchValue]);

  const handleSelectTag = (tag: TarefaTag) => {
    const isAssigned = assignedTagIds.includes(tag.id);
    if (isAssigned) {
      unassignTag.mutate({ tarefaId, tagId: tag.id });
    } else {
      assignTag.mutate({ tarefaId, tagId: tag.id });
    }
    setSearchValue("");
  };

  const handleCreateTag = async () => {
    if (!searchValue.trim()) return;

    const newTag = await createTag.mutateAsync({
      name: searchValue.trim(),
      color: selectedColor,
    });

    if (newTag) {
      assignTag.mutate({ tarefaId, tagId: newTag.id });
    }

    setSearchValue("");
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    setIsCreating(true);
  };

  return (
    <div className="space-y-3 w-64">
      {/* Search/Create Input */}
      <Command className="rounded-lg border" shouldFilter={false}>
        <Input
          placeholder="Buscar ou criar tag..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="border-0 focus-visible:ring-0 h-9"
          onKeyDown={(e) => {
            if (e.key === "Enter" && canCreateTag && !isCreating) {
              handleStartCreate();
            }
          }}
        />
        <CommandList className="max-h-48">
          {filteredTags.length === 0 && !canCreateTag && (
            <CommandEmpty className="py-3 text-sm text-muted-foreground text-center">
              Nenhuma tag encontrada
            </CommandEmpty>
          )}

          {filteredTags.length > 0 && (
            <CommandGroup>
              {filteredTags.map((tag) => {
                const isAssigned = assignedTagIds.includes(tag.id);
                return (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => handleSelectTag(tag)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1">{tag.name}</span>
                    {isAssigned && <Check className="h-4 w-4 text-primary" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Create Option */}
          {canCreateTag && !isCreating && (
            <CommandGroup>
              <CommandItem
                onSelect={handleStartCreate}
                className="flex items-center gap-2 cursor-pointer text-primary"
              >
                <Plus className="h-4 w-4" />
                <span>Criar "{searchValue}"</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>

      {/* Color Picker for New Tag */}
      {isCreating && (
        <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
          <p className="text-sm font-medium">
            Criar tag: <span className="text-primary">"{searchValue}"</span>
          </p>
          
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
              disabled={createTag.isPending}
              className="flex-1"
            >
              Criar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setSearchValue("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
