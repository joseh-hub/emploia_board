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
import { Loader2 } from "lucide-react";

interface RenameFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
  currentName: string;
  isLoading?: boolean;
}

export function RenameFileModal({
  open,
  onOpenChange,
  onConfirm,
  currentName,
  isLoading = false,
}: RenameFileModalProps) {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Krona_One']">Renomear arquivo</DialogTitle>
          <DialogDescription>
            Digite o novo nome para o arquivo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-name">Nome do arquivo</Label>
              <Input
                id="file-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do arquivo"
                autoFocus
                disabled={isLoading}
              />
            </div>
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
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Renomear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
