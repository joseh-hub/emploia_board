import { useState } from "react";
import { FolderPlus } from "lucide-react";
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

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
  isLoading?: boolean;
}

export function CreateFolderModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CreateFolderModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
      setName("");
    }
  };

  const handleClose = () => {
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-['Krona_One']">
              <FolderPlus className="h-5 w-5 text-[#CBC5EA]" />
              Nova Pasta
            </DialogTitle>
            <DialogDescription>
              Insira o nome para a nova pasta.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="folder-name">Nome da pasta</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Minha pasta"
              className="mt-2"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading} className="bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0">
              {isLoading ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
