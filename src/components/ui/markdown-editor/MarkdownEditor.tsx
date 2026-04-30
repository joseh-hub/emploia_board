import { useState, useRef, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { MarkdownPreview } from "./MarkdownPreview";
import { TooltipProvider } from "@/components/ui/tooltip";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => Promise<void> | void;
  isSaving?: boolean;
  placeholder?: string;
  minHeight?: string;
  showToolbar?: boolean;
  autoSave?: boolean;
  debounceMs?: number;
  emptyPreviewMessage?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  onSave,
  isSaving = false,
  placeholder = "Adicione uma descrição... (Markdown suportado)",
  minHeight = "150px",
  showToolbar = true,
  autoSave = true,
  debounceMs = 1000,
  emptyPreviewMessage = "Sem descrição",
  className,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("preview");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef(value);

  // NOTE: lastSavedRef tracks the last successfully persisted value.
  // It should NOT be synced on every keystroke (value change), otherwise debounced
  // saves will be skipped before they execute.

  // Auto-save with debounce
  const triggerSave = useCallback(
    async (newValue: string) => {
      if (!onSave || newValue === lastSavedRef.current) return;
      await onSave(newValue);
      lastSavedRef.current = newValue;
    },
    [onSave]
  );

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);

      if (autoSave && onSave) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          triggerSave(newValue);
        }, debounceMs);
      }
    },
    [onChange, autoSave, onSave, debounceMs, triggerSave]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.slice(start, end);

      const wrapSelection = (wrapper: string) => {
        e.preventDefault();
        if (selectedText) {
          const newText =
            value.slice(0, start) +
            wrapper +
            selectedText +
            wrapper +
            value.slice(end);
          handleChange(newText);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
              start + wrapper.length,
              end + wrapper.length
            );
          }, 0);
        } else {
          const newText =
            value.slice(0, start) + wrapper + wrapper + value.slice(end);
          handleChange(newText);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
              start + wrapper.length,
              start + wrapper.length
            );
          }, 0);
        }
      };

      const insertLink = () => {
        e.preventDefault();
        if (selectedText) {
          const newText =
            value.slice(0, start) + `[${selectedText}](url)` + value.slice(end);
          handleChange(newText);
          setTimeout(() => {
            textarea.focus();
            const urlStart = start + selectedText.length + 3;
            textarea.setSelectionRange(urlStart, urlStart + 3);
          }, 0);
        } else {
          const newText =
            value.slice(0, start) + "[](url)" + value.slice(end);
          handleChange(newText);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + 1, start + 1);
          }, 0);
        }
      };

      // Ctrl+B = Bold
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        wrapSelection("**");
      }
      // Ctrl+I = Italic
      else if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        wrapSelection("*");
      }
      // Ctrl+K = Link
      else if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        insertLink();
      }
      // Ctrl+Shift+C = Code
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        wrapSelection("`");
      }
    },
    [value, handleChange]
  );

  return (
    <TooltipProvider>
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Descrição</h4>
          </div>
          {isSaving && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Salvando...
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="preview" className="text-xs gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Visualizar
            </TabsTrigger>
            <TabsTrigger value="write" className="text-xs gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Escrever
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-2">
            <div
              className="p-3 rounded-md border bg-muted/30"
              style={{ minHeight }}
            >
              <MarkdownPreview
                content={value}
                emptyMessage={emptyPreviewMessage}
              />
            </div>
          </TabsContent>

          <TabsContent value="write" className="mt-2">
            <div className="rounded-md border overflow-hidden">
              {showToolbar && (
                <MarkdownToolbar
                  textareaRef={textareaRef}
                  value={value}
                  onChange={handleChange}
                />
              )}
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                  "resize-y border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  showToolbar && "rounded-t-none"
                )}
                style={{ minHeight }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Markdown suportado • Atalhos: Ctrl+B (negrito), Ctrl+I (itálico), Ctrl+K (link) • Salva automaticamente
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
