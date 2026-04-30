import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Code,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
}

type FormatAction = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  action: () => void;
};

export function MarkdownToolbar({
  textareaRef,
  value,
  onChange,
}: MarkdownToolbarProps) {
  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end);

    const newText =
      value.slice(0, start) + before + selectedText + after + value.slice(end);

    onChange(newText);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText
        ? start + before.length + selectedText.length + after.length
        : start + before.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const wrapSelection = (wrapper: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end);

    if (selectedText) {
      const newText =
        value.slice(0, start) + wrapper + selectedText + wrapper + value.slice(end);
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + wrapper.length,
          end + wrapper.length
        );
      }, 0);
    } else {
      insertText(wrapper, wrapper);
    }
  };

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;

    const newText = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end);

    if (selectedText) {
      const newText =
        value.slice(0, start) + `[${selectedText}](url)` + value.slice(end);
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        // Select "url" for easy replacement
        const urlStart = start + selectedText.length + 3;
        textarea.setSelectionRange(urlStart, urlStart + 3);
      }, 0);
    } else {
      insertText("[", "](url)");
    }
  };

  const ToolbarButton = React.forwardRef<
    HTMLButtonElement,
    {
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      shortcut?: string;
      onClick: () => void;
    }
  >(({ icon: Icon, label, shortcut, onClick }, ref) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClick}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
        {shortcut && (
          <span className="ml-2 text-muted-foreground">{shortcut}</span>
        )}
      </TooltipContent>
    </Tooltip>
  ));
  ToolbarButton.displayName = "ToolbarButton";

  return (
    <div className="flex items-center gap-0.5 p-1 border-b bg-muted/30 rounded-t-md flex-wrap">
      {/* Bold */}
      <ToolbarButton
        icon={Bold}
        label="Negrito"
        shortcut="Ctrl+B"
        onClick={() => wrapSelection("**")}
      />

      {/* Italic */}
      <ToolbarButton
        icon={Italic}
        label="Itálico"
        shortcut="Ctrl+I"
        onClick={() => wrapSelection("*")}
      />

      {/* Strikethrough */}
      <ToolbarButton
        icon={Strikethrough}
        label="Riscado"
        onClick={() => wrapSelection("~~")}
      />

      <div className="w-px h-5 bg-border mx-1" />

      {/* Headers dropdown */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 gap-1">
                <Heading1 className="h-4 w-4" />
                <span className="text-xs">▼</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Títulos
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" className="bg-popover z-50">
          <DropdownMenuItem onClick={() => insertAtLineStart("# ")}>
            <Heading1 className="h-4 w-4 mr-2" />
            Título 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => insertAtLineStart("## ")}>
            <Heading2 className="h-4 w-4 mr-2" />
            Título 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => insertAtLineStart("### ")}>
            <Heading3 className="h-4 w-4 mr-2" />
            Título 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Link */}
      <ToolbarButton
        icon={Link}
        label="Link"
        shortcut="Ctrl+K"
        onClick={insertLink}
      />

      {/* Code */}
      <ToolbarButton
        icon={Code}
        label="Código"
        onClick={() => wrapSelection("`")}
      />

      <div className="w-px h-5 bg-border mx-1" />

      {/* Unordered List */}
      <ToolbarButton
        icon={List}
        label="Lista"
        onClick={() => insertAtLineStart("- ")}
      />

      {/* Ordered List */}
      <ToolbarButton
        icon={ListOrdered}
        label="Lista numerada"
        onClick={() => insertAtLineStart("1. ")}
      />

      {/* Quote */}
      <ToolbarButton
        icon={Quote}
        label="Citação"
        onClick={() => insertAtLineStart("> ")}
      />
    </div>
  );
}
