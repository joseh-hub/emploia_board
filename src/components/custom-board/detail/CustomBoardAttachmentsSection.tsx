import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCustomBoardCardAttachments,
  useUploadCustomBoardCardAttachment,
  useDeleteCustomBoardCardAttachment,
  useCustomBoardCardAttachmentSignedUrl,
  type CustomBoardCardAttachment,
} from "@/hooks/useCustomBoardCardAttachments";
import { UploadFileModal } from "@/components/wiki/UploadFileModal";
import {
  Paperclip,
  Plus,
  FileText,
  Image,
  File,
  Trash2,
  Download,
  Loader2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomBoardAttachmentsSectionProps {
  cardId: string;
  boardId: string;
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageType(fileType: string): boolean {
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileType.toLowerCase());
}

function FileIcon({ fileType }: { fileType: string }) {
  const t = fileType.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(t)) {
    return <Image className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
  if (["pdf", "doc", "docx", "xls", "xlsx"].includes(t)) {
    return <FileText className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
  return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
}

function AttachmentRow({
  attachment,
  onDelete,
}: {
  attachment: CustomBoardCardAttachment;
  onDelete: () => void;
}) {
  const { data: signedUrl, isLoading: loadingUrl } =
    useCustomBoardCardAttachmentSignedUrl(attachment.storage_path);
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const isImage = isImageType(attachment.file_type);

  const handlePreview = async () => {
    if (!signedUrl) return;
    setPreviewing(true);
    try {
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      window.open(signedUrl, "_blank", "noopener");
    } finally {
      setPreviewing(false);
    }
  };

  const handleDownload = async () => {
    if (!signedUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(signedUrl, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group overflow-hidden",
        "hover:bg-zinc-800/50"
      )}
    >
      <FileIcon fileType={attachment.file_type} />
      <div className="flex-1 min-w-0 overflow-hidden">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm font-medium truncate text-zinc-200">{attachment.name}</p>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="break-all text-xs">{attachment.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-xs text-zinc-500">{formatSize(attachment.size_bytes)}</p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {isImage && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handlePreview}
            disabled={loadingUrl || !signedUrl || previewing}
          >
            {previewing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleDownload}
          disabled={loadingUrl || !signedUrl || downloading}
        >
          {loadingUrl || downloading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Download className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function CustomBoardAttachmentsSection({ cardId, boardId }: CustomBoardAttachmentsSectionProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: attachments = [], isLoading } = useCustomBoardCardAttachments(cardId);
  const uploadAttachment = useUploadCustomBoardCardAttachment();
  const deleteAttachment = useDeleteCustomBoardCardAttachment();

  const handleUpload = (file: File) => {
    uploadAttachment.mutate(
      { cardId, boardId, file },
      { onSuccess: () => setUploadOpen(false) }
    );
  };

  const handleDelete = (a: CustomBoardCardAttachment) => {
    deleteAttachment.mutate({
      id: a.id,
      cardId,
      boardId,
      storagePath: a.storage_path,
    });
  };

  return (
    <div className="space-y-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#3F1757]/10 flex items-center justify-center">
            <Paperclip className="h-4 w-4 text-[#CBC5EA]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">Anexos</h3>
          </div>
        </div>
        {attachments.length > 0 && (
          <Badge variant="secondary" className="text-xs font-medium">
            {attachments.length}
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        {isLoading ? (
          <div className="flex items-center gap-2 py-4 text-zinc-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando anexos...
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-sm">
            Nenhum anexo. Clique em &quot;Anexar&quot; para adicionar.
          </div>
        ) : (
          attachments.map((a) => (
            <AttachmentRow key={a.id} attachment={a} onDelete={() => handleDelete(a)} />
          ))
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto border-zinc-700 text-zinc-300 hover:bg-[#3F1757]/10 hover:text-[#CBC5EA] hover:border-[#3F1757]/50"
        onClick={() => setUploadOpen(true)}
        disabled={uploadAttachment.isPending}
      >
        <Plus className="h-4 w-4 mr-1" />
        Anexar
      </Button>

      <UploadFileModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onConfirm={handleUpload}
        isLoading={uploadAttachment.isPending}
      />
    </div>
  );
}
