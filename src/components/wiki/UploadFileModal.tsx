import { useRef, useState } from "react";
import { Upload, X, File } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => void;
  isLoading?: boolean;
}

export function UploadFileModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: UploadFileModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onConfirm(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-['Krona_One']">
            <Upload className="h-5 w-5 text-[#CBC5EA]" />
            Upload de Arquivo
          </DialogTitle>
          <DialogDescription>
            Arraste um arquivo ou clique para selecionar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          />

          {!selectedFile ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">
                Clique para selecionar ou arraste um arquivo
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOCX, XLSX, imagens e outros formatos
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
              <File className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatSize(selectedFile.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedFile || isLoading} className="bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0">
            {isLoading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
