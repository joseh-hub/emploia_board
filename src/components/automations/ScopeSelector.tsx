import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomBoards } from "@/hooks/useCustomBoards";
import { Globe, Target } from "lucide-react";

interface ScopeSelectorProps {
  scope: "global" | "board";
  boardId: string | null;
  onScopeChange: (scope: "global" | "board") => void;
  onBoardChange: (boardId: string | null) => void;
}

// Static boards that are always available
const STATIC_BOARDS = [
  { id: "clientes", name: "Clientes", type: "static" },
  { id: "projetos", name: "Projetos", type: "static" },
  { id: "tarefas", name: "Tarefas", type: "static" },
];

export function ScopeSelector({
  scope,
  boardId,
  onScopeChange,
  onBoardChange,
}: ScopeSelectorProps) {
  const { data: customBoards } = useCustomBoards();

  const allBoards = [
    ...STATIC_BOARDS,
    ...(customBoards?.map((b) => ({
      id: b.id,
      name: b.name,
      type: "custom" as const,
    })) || []),
  ];

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Escopo</Label>

      <RadioGroup
        value={scope}
        onValueChange={(value) => {
          onScopeChange(value as "global" | "board");
          if (value === "global") {
            onBoardChange(null);
          }
        }}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="global" id="scope-global" />
          <Label
            htmlFor="scope-global"
            className="flex items-center gap-1.5 cursor-pointer font-normal"
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
            Global
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="board" id="scope-board" />
          <Label
            htmlFor="scope-board"
            className="flex items-center gap-1.5 cursor-pointer font-normal"
          >
            <Target className="h-4 w-4 text-muted-foreground" />
            Board Específico
          </Label>
        </div>
      </RadioGroup>

      {scope === "board" && (
        <Select
          value={boardId || ""}
          onValueChange={(value) => onBoardChange(value || null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um board" />
          </SelectTrigger>
          <SelectContent>
            {allBoards.map((board) => (
              <SelectItem key={board.id} value={board.id}>
                <div className="flex items-center gap-2">
                  <span>{board.name}</span>
                  {board.type === "static" && (
                    <span className="text-[10px] text-muted-foreground">(Sistema)</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <p className="text-xs text-muted-foreground">
        {scope === "global"
          ? "Esta automação será executada em todos os boards."
          : boardId
          ? "Esta automação será executada apenas no board selecionado."
          : "Selecione um board para esta automação."}
      </p>
    </div>
  );
}
