import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Download, ExternalLink, SplitSquareVertical, MousePointerClick } from "lucide-react";
import { WikiFile, useUpdateWikiFileContent } from "@/hooks/useWikiFiles";
import { getWikiFileSignedUrl } from "@/hooks/useWikiUpload";
import { Button } from "@/components/ui/button";
import { MarkdownEditor, InlineMarkdownEditor } from "@/components/ui/markdown-editor";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WikiFileViewerProps {
  file: WikiFile;
  onBack: () => void;
}

export function WikiFileViewer({ file, onBack }: WikiFileViewerProps) {
  const [content, setContent] = useState(file.content || "");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"tabs" | "inline">("inline");
  const updateContent = useUpdateWikiFileContent();

  // Refs to avoid stale closures and prevent infinite loops
  const contentRef = useRef(content);
  const lastSavedRef = useRef(file.content || "");
  const fileIdRef = useRef(file.id);
  const fileTypeRef = useRef(file.file_type);
  const updateContentRef = useRef(updateContent);
  const onBackRef = useRef(onBack);

  // Keep refs up to date
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    fileIdRef.current = file.id;
    fileTypeRef.current = file.file_type;
  }, [file.id, file.file_type]);

  useEffect(() => {
    updateContentRef.current = updateContent;
  }, [updateContent]);

  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  // Get signed URL for binary files
  useEffect(() => {
    if (file.storage_path) {
      getWikiFileSignedUrl(file.storage_path).then(setDownloadUrl);
    }
  }, [file.storage_path]);

  // Sync content when file changes
  useEffect(() => {
    setContent(file.content || "");
    lastSavedRef.current = file.content || "";
  }, [file.id, file.content]);

  const handleSave = useCallback(async (newValue: string) => {
    await updateContentRef.current.mutateAsync({ id: fileIdRef.current, content: newValue });
    lastSavedRef.current = newValue;
  }, []);

  // Stable flush function that uses refs - no dependencies that change
  const flushPendingSave = useCallback(async () => {
    if (fileTypeRef.current !== "markdown") return;
    const latest = contentRef.current ?? "";
    if (latest === lastSavedRef.current) return;

    try {
      await updateContentRef.current.mutateAsync({ id: fileIdRef.current, content: latest });
      lastSavedRef.current = latest;
    } catch {
      // toast handled by mutation hook
    }
  }, []);

  // Flush pending debounced changes on unmount only
  useEffect(() => {
    return () => {
      void flushPendingSave();
    };
  }, [flushPendingSave]);

  const handleBack = useCallback(async () => {
    try {
      await flushPendingSave();
    } finally {
      onBackRef.current();
    }
  }, [flushPendingSave]);

  // Markdown file
  if (file.file_type === "markdown") {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <span className="font-medium">{file.name}</span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditorMode(prev => prev === "tabs" ? "inline" : "tabs")}
                >
                  {editorMode === "tabs" ? (
                    <>
                      <MousePointerClick className="h-4 w-4 mr-2" />
                      Modo Foco
                    </>
                  ) : (
                    <>
                      <SplitSquareVertical className="h-4 w-4 mr-2" />
                      Modo Abas
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {editorMode === "tabs" 
                  ? "Alternar para edição inline (clique para editar)" 
                  : "Alternar para editor com abas separadas"
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {editorMode === "inline" ? (
            <InlineMarkdownEditor
              value={content}
              onChange={setContent}
              onSave={handleSave}
              isSaving={updateContent.isPending}
              autoSave
              debounceMs={1500}
              minHeight="400px"
              placeholder="Comece a escrever..."
            />
          ) : (
            <MarkdownEditor
              value={content}
              onChange={setContent}
              onSave={handleSave}
              isSaving={updateContent.isPending}
              autoSave
              debounceMs={1500}
              minHeight="400px"
              placeholder="Comece a escrever..."
            />
          )}
        </div>
      </div>
    );
  }

  // PDF file
  if (file.file_type === "pdf" && downloadUrl) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <span className="font-medium">{file.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir em nova aba
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={downloadUrl} download={file.name}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <object
            data={downloadUrl}
            type="application/pdf"
            className="w-full h-full min-h-[600px] rounded-lg border"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground mb-4">
                Não foi possível exibir o PDF no navegador.
              </p>
              <Button asChild>
                <a href={downloadUrl} download={file.name}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            </div>
          </object>
        </div>
      </div>
    );
  }

  // Image file
  if (file.file_type === "image" && downloadUrl) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <span className="font-medium">{file.name}</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={downloadUrl} download={file.name}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        </div>

        <div className="flex-1 p-4 flex items-center justify-center">
          <img
            src={downloadUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      </div>
    );
  }

  // Other files - download only
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <span className="font-medium">{file.name}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">
          Este tipo de arquivo não pode ser visualizado no navegador.
        </p>
        {downloadUrl && (
          <Button asChild>
            <a href={downloadUrl} download={file.name}>
              <Download className="h-4 w-4 mr-2" />
              Download {file.name}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
