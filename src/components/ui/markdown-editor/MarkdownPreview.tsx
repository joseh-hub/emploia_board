import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  emptyMessage?: string;
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Validate URL to prevent javascript: protocol
function isValidUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:")) {
    return false;
  }
  return true;
}

// Parse markdown to safe HTML
function parseMarkdown(text: string): string {
  // First escape HTML
  let html = escapeHtml(text);

  // Code blocks (```)
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-muted p-3 rounded-md overflow-x-auto my-2"><code>$1</code></pre>'
  );

  // Inline code (`)
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
  );

  // Headers (must be at start of line)
  html = html.replace(
    /^###### (.+)$/gm,
    '<h6 class="text-sm font-semibold mt-3 mb-1">$1</h6>'
  );
  html = html.replace(
    /^##### (.+)$/gm,
    '<h5 class="text-sm font-semibold mt-3 mb-1">$1</h5>'
  );
  html = html.replace(
    /^#### (.+)$/gm,
    '<h4 class="text-base font-semibold mt-3 mb-1">$1</h4>'
  );
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>'
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>'
  );

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic (*text* or _text_)
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Strikethrough (~~text~~)
  html = html.replace(/~~(.+?)~~/g, '<del class="line-through">$1</del>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (!isValidUrl(url)) {
      return text; // Return just the text if URL is invalid
    }
    return `<a href="${url}" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    if (!isValidUrl(url)) {
      return alt || ""; // Return just the alt if URL is invalid
    }
    return `<img src="${url}" alt="${alt}" class="max-w-full rounded-md my-2" />`;
  });

  // Blockquotes (> text)
  html = html.replace(
    /^&gt; (.+)$/gm,
    '<blockquote class="border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground my-2">$1</blockquote>'
  );

  // Unordered lists (- or *)
  html = html.replace(
    /^[\-\*] (.+)$/gm,
    '<li class="ml-4 list-disc list-inside">$1</li>'
  );

  // Ordered lists (1. 2. 3.)
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="ml-4 list-decimal list-inside">$1</li>'
  );

  // Horizontal rules (--- or ***)
  html = html.replace(
    /^(---|\*\*\*)$/gm,
    '<hr class="my-4 border-t border-border" />'
  );

  // Line breaks (double newline = paragraph break)
  html = html.replace(/\n\n/g, "</p><p class='my-2'>");
  
  // Single line breaks
  html = html.replace(/\n/g, "<br />");

  // Wrap in paragraph if not already structured
  if (!html.startsWith("<")) {
    html = `<p class="my-2">${html}</p>`;
  }

  return html;
}

export function MarkdownPreview({
  content,
  className,
  emptyMessage = "Sem conteúdo",
}: MarkdownPreviewProps) {
  if (!content?.trim()) {
    return (
      <p className={cn("text-muted-foreground italic", className)}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-semibold",
        "prose-a:text-primary prose-a:underline",
        "prose-code:bg-muted prose-code:px-1 prose-code:rounded",
        "prose-blockquote:border-l-2 prose-blockquote:pl-4",
        className
      )}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}
