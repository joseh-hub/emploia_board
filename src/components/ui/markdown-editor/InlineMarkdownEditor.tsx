import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { MarkdownPreview } from "./MarkdownPreview";
import { TooltipProvider } from "@/components/ui/tooltip";

interface InlineMarkdownEditorProps {
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
  containerClassName?: string;
  label?: string;
  showLabel?: boolean;
  blurDelay?: number;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function InlineMarkdownEditor({
  value,
  onChange,
  onSave,
  isSaving = false,
  placeholder = "Clique para adicionar descrição...",
  minHeight = "100px",
  showToolbar = true,
  autoSave = true,
  debounceMs = 1000,
  emptyPreviewMessage = "Clique para adicionar descrição...",
  className,
  containerClassName,
  label = "Descrição",
  showLabel = true,
  blurDelay = 300,
}: InlineMarkdownEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef(value);
  const isInteractingRef = useRef(false);

  // Sync save state with isSaving prop
  useEffect(() => {
    if (isSaving) {
      setSaveState("saving");
    } else if (saveState === "saving") {
      setSaveState("saved");
      const timeout = setTimeout(() => setSaveState("idle"), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isSaving, saveState]);

  // NOTE: lastSavedRef tracks the last successfully persisted value.
  // It should NOT be synced on every keystroke (value change), otherwise debounced
  // saves will be skipped before they execute.

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Position cursor at the end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  // Auto-save with debounce
  const triggerSave = useCallback(
    async (newValue: string) => {
      if (!onSave || newValue === lastSavedRef.current) return;
      setSaveState("saving");
      try {
        await onSave(newValue);
        lastSavedRef.current = newValue;
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("error");
        setTimeout(() => setSaveState("idle"), 3000);
      }
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

  const handleEnterEditMode = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsEditing(true);
  }, []);

  const handleExitEditMode = useCallback(() => {
    if (isInteractingRef.current) return;
    
    blurTimeoutRef.current = setTimeout(() => {
      setIsEditing(false);
    }, blurDelay);
  }, [blurDelay]);

  const handleContainerBlur = useCallback(
    (e: React.FocusEvent) => {
      // Check if the new focus target is still within the container
      if (containerRef.current?.contains(e.relatedTarget as Node)) {
        return;
      }
      handleExitEditMode();
    },
    [handleExitEditMode]
  );

  const handleToolbarMouseDown = useCallback(() => {
    isInteractingRef.current = true;
  }, []);

  const handleToolbarMouseUp = useCallback(() => {
    isInteractingRef.current = false;
    textareaRef.current?.focus();
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Esc to exit edit mode
      if (e.key === "Escape") {
        e.preventDefault();
        setIsEditing(false);
        return;
      }

      // Ctrl+Enter to save and exit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (onSave && value !== lastSavedRef.current) {
          triggerSave(value);
        }
        setIsEditing(false);
        return;
      }

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
          const newText = value.slice(0, start) + "[](url)" + value.slice(end);
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
    [value, handleChange, onSave, triggerSave]
  );

  const renderStateIndicator = () => {
    if (saveState === "saving" || isSaving) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Salvando...</span>
        </div>
      );
    }
    if (saveState === "saved") {
      return (
        <div className="flex items-center gap-1.5 text-xs text-success">
          <Check className="h-3 w-3" />
          <span>Salvo</span>
        </div>
      );
    }
    return null;
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-2", className)}>
        {showLabel && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">{label}</h4>
            </div>
            {renderStateIndicator()}
          </div>
        )}

        <div
          ref={containerRef}
          onBlur={handleContainerBlur}
          className={cn(
            "rounded-md border transition-all duration-200",
            isEditing
              ? "ring-2 ring-[#3F1757]/20 border-[#3F1757] bg-zinc-900"
              : "border-zinc-700 bg-zinc-800/50 hover:border-[#3F1757]/40 hover:bg-zinc-800 cursor-text",
            containerClassName
          )}
          role="textbox"
          aria-multiline="true"
          aria-expanded={isEditing}
          aria-label={label}
        >
          {isEditing ? (
            // Edit Mode
            <div className="animate-in fade-in duration-150">
              {showToolbar && (
                <div
                  onMouseDown={handleToolbarMouseDown}
                  onMouseUp={handleToolbarMouseUp}
                  className="animate-in slide-in-from-top-2 fade-in duration-200"
                >
                  <MarkdownToolbar
                    textareaRef={textareaRef}
                    value={value}
                    onChange={handleChange}
                  />
                </div>
              )}
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                  "resize-y border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent",
                  showToolbar && "rounded-t-none"
                )}
                style={{ minHeight }}
              />
              <p className="text-xs text-muted-foreground px-3 pb-2">
                Markdown suportado • Esc para sair • Ctrl+Enter para salvar
              </p>
            </div>
          ) : (
            // Preview Mode
            <div
              onClick={handleEnterEditMode}
              onFocus={handleEnterEditMode}
              tabIndex={0}
              className="p-3 animate-in fade-in duration-150 focus:outline-none"
              style={{ minHeight }}
            >
              <MarkdownPreview
                content={value}
                emptyMessage={emptyPreviewMessage}
              />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
