import { useState } from "react";
import { FilePlus } from "lucide-react";
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

interface CreateFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
  isLoading?: boolean;
}

export function CreateFileModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CreateFileModalProps) {
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
              <FilePlus className="h-5 w-5 text-[#CBC5EA]" />
              Novo Arquivo
            </DialogTitle>
            <DialogDescription>
              Insira o nome para o novo arquivo Markdown.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="file-name">Nome do arquivo</Label>
            <Input
              id="file-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="documento"
              className="mt-2"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1">
              A extensão .md será adicionada automaticamente.
            </p>
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
