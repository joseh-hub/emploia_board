import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateBoard, CustomBoard } from "@/hooks/useCustomBoards";
import { UserMultiSelect } from "./UserMultiSelect";
import { useAuth } from "@/contexts/AuthContext";

interface EditBoardModalProps {
  board: CustomBoard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBoardModal({ board, open, onOpenChange }: EditBoardModalProps) {
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description || "");
  const [visibility, setVisibility] = useState<"all" | "private" | "specific">(
    board.visibility as "all" | "private" | "specific"
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>(board.allowed_users || []);

  const { user } = useAuth();
  const updateBoard = useUpdateBoard();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName(board.name);
      setDescription(board.description || "");
      setVisibility(board.visibility as "all" | "private" | "specific");
      setSelectedUsers(board.allowed_users || []);
    }
  }, [open, board.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    // For "specific" visibility, ensure creator is in allowed_users
    const allowedUsers =
      visibility === "specific" && user
        ? [...new Set([...selectedUsers, user.id])]
        : [];

    await updateBoard.mutateAsync({
      id: board.id,
      name: name.trim(),
      description: description.trim() || null,
      visibility,
      allowed_users: allowedUsers,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="font-['Krona_One']">Editar Board</DialogTitle>
            <DialogDescription>
              Altere as configurações do board.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-3 overflow-y-auto flex-1 pr-1">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Board *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Marketing, Vendas, Desenvolvimento..."
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito deste board..."
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="visibility">Visibilidade</Label>
              <Select
                value={visibility}
                onValueChange={(value: "all" | "private" | "specific") =>
                  setVisibility(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a visibilidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  <SelectItem value="private">Somente eu</SelectItem>
                  <SelectItem value="specific">Usuários específicos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {visibility === "specific" && (
              <div className="grid gap-2">
                <Label>Selecionar Usuários</Label>
                <UserMultiSelect
                  selectedUsers={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                  excludeUserId={user?.id}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateBoard.isPending || !name.trim()} className="bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0">
              {updateBoard.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
