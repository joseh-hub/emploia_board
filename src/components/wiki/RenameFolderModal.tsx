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

interface RenameFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
  currentName: string;
  isLoading?: boolean;
}

export function RenameFolderModal({
  open,
  onOpenChange,
  onConfirm,
  currentName,
  isLoading,
}: RenameFolderModalProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-['Krona_One']">Renomear Pasta</DialogTitle>
          <DialogDescription>
            Digite o novo nome para a pasta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="folderName">Nome da Pasta</Label>
            <Input
              id="folderName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da pasta"
              autoFocus
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading} className="bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0">
              {isLoading ? "Renomeando..." : "Renomear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
