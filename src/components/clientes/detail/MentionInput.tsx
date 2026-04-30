import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MentionUser {
  id: string;
  name: string;
  email?: string | null;
  avatar_url?: string | null;
}

interface MentionInputProps {
  onSubmit: (content: string, mentions: string[]) => void;
  isLoading?: boolean;
  users: MentionUser[];
  placeholder?: string;
}

export function MentionInput({ 
  onSubmit, 
  isLoading, 
  users,
  placeholder = "Adicione um comentário... Use @ para mencionar (Markdown suportado)" 
}: MentionInputProps) {
  const [content, setContent] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (value: string) => {
    setContent(value);

    // Check for @ mention
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if we're still in a mention (no space after @)
      if (!textAfterAt.includes(" ")) {
        setMentionStart(lastAtIndex);
        const searchTerm = textAfterAt.toLowerCase();
        const filtered = users.filter((u) =>
          u.name.toLowerCase().includes(searchTerm) ||
          (u.email && u.email.toLowerCase().includes(searchTerm))
        );
        setFilteredSuggestions(filtered.map(u => u.name));
        setShowSuggestions(filtered.length > 0);
        return;
      }
    }

    setShowSuggestions(false);
    setMentionStart(-1);
  };

  const insertMention = (name: string) => {
    if (mentionStart === -1) return;

    const before = content.slice(0, mentionStart);
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const after = content.slice(cursorPos);

    const newContent = `${before}@${name} ${after}`;
    setContent(newContent);
    setShowSuggestions(false);
    setMentionStart(-1);

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;

    // Extract mentions from content
    const mentionRegex = /@(\w+(?:\s\w+)?)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionName = match[1];
      if (users.some((u) => u.name.toLowerCase().startsWith(mentionName.toLowerCase()))) {
        mentions.push(mentionName);
      }
    }

    onSubmit(content, mentions);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[60px] resize-none flex-1"
          disabled={isLoading}
        />
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading}
          size="icon"
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute left-0 right-12 top-full mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
          {filteredSuggestions.map((name) => {
            const user = users.find(u => u.name === name);
            const initials = name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
            
            return (
              <button
                key={name}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2",
                  "focus:outline-none focus:bg-accent"
                )}
                onClick={() => insertMention(name)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">@{name}</span>
                  {user?.email && (
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
