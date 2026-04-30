import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X, Plus, Check } from "lucide-react";
import { CardTag } from "@/hooks/useCustomBoardCards";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
  { name: "Vermelho", hex: "#ef4444" },
  { name: "Laranja", hex: "#f97316" },
  { name: "Amarelo", hex: "#f59e0b" },
  { name: "Verde", hex: "#22c55e" },
  { name: "Azul", hex: "#3b82f6" },
  { name: "Roxo", hex: "#8b5cf6" },
  { name: "Rosa", hex: "#ec4899" },
  { name: "Cinza", hex: "#94a3b8" },
];

interface CustomBoardTagsSectionProps {
  tags: CardTag[];
  onChange: (tags: CardTag[]) => void;
  allBoardTags?: CardTag[];
}

export function CustomBoardTagsSection({ tags, onChange, allBoardTags = [] }: CustomBoardTagsSectionProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[4].hex);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleRemoveTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (!searchValue.trim()) return;
    
    const newTag: CardTag = {
      name: searchValue.trim(),
      color: selectedColor,
    };
    
    onChange([...tags, newTag]);
    setSearchValue("");
    setIsCreating(false);
  };

  const handleSelectExistingTag = (tag: CardTag) => {
    // Don't add if already assigned
    if (tags.some((t) => t.name.toLowerCase() === tag.name.toLowerCase())) return;
    onChange([...tags, { name: tag.name, color: tag.color }]);
    setSearchValue("");
    setIsPopoverOpen(false);
  };

  // Deduplicate all board tags by name (lowercase)
  const uniqueBoardTags = useMemo(() => {
    const seen = new Set<string>();
    const result: CardTag[] = [];
    for (const tag of allBoardTags) {
      const key = tag.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(tag);
      }
    }
    return result;
  }, [allBoardTags]);

  // Tags available to select (not already assigned to this card)
  const availableTags = useMemo(() => {
    const assignedNames = new Set(tags.map((t) => t.name.toLowerCase()));
    let filtered = uniqueBoardTags.filter((t) => !assignedNames.has(t.name.toLowerCase()));
    if (searchValue.trim()) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    return filtered;
  }, [uniqueBoardTags, tags, searchValue]);

  const canCreateTag = useMemo(() => {
    if (!searchValue.trim()) return false;
    // Can't create if already assigned OR already exists in board
    return !tags.some(
      (tag) => tag.name.toLowerCase() === searchValue.toLowerCase()
    ) && !uniqueBoardTags.some(
      (tag) => tag.name.toLowerCase() === searchValue.toLowerCase()
    );
  }, [tags, uniqueBoardTags, searchValue]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Current tags - inline with X on hover */}
      {tags.map((tag, index) => (
        <Badge
          key={index}
          variant="outline"
          className={cn(
            "group pl-2 pr-1.5 py-1 text-xs font-medium gap-1.5 transition-all",
            "hover:pr-1"
          )}
          style={{
            backgroundColor: `${tag.color}15`,
            borderColor: `${tag.color}30`,
            color: tag.color,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: tag.color }}
          />
          {tag.name}
          <button
            onClick={() => handleRemoveTag(index)}
            className="opacity-0 group-hover:opacity-100 hover:bg-black/10 rounded-full p-0.5 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Popover for adding tags */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full hover:bg-muted"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-2 w-64" align="start" sideOffset={8}>
          <div className="space-y-3">
            {/* Search/Create Input */}
            <Command className="rounded-lg border" shouldFilter={false}>
              <Input
                placeholder="Criar nova tag..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="border-0 focus-visible:ring-0 h-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canCreateTag && !isCreating) {
                    setIsCreating(true);
                  }
                }}
              />
              <CommandList className="max-h-48">
                {/* Existing board tags */}
                {availableTags.length > 0 && (
                  <CommandGroup heading="Tags existentes">
                    {availableTags.map((tag, i) => (
                      <CommandItem
                        key={`${tag.name}-${i}`}
                        onSelect={() => handleSelectExistingTag(tag)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="flex-1">{tag.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {availableTags.length === 0 && !canCreateTag && searchValue.trim() && (
                  <CommandEmpty className="py-3 text-sm text-muted-foreground text-center">
                    Tag já adicionada
                  </CommandEmpty>
                )}

                {/* Create Option */}
                {canCreateTag && !isCreating && (
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => setIsCreating(true)}
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
                        "w-6 h-6 rounded-full transition-all flex items-center justify-center",
                        selectedColor === color.hex && "ring-2 ring-offset-2 ring-primary"
                      )}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColor(color.hex)}
                      title={color.name}
                    >
                      {selectedColor === color.hex && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      handleAddTag();
                      setIsPopoverOpen(false);
                    }}
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
