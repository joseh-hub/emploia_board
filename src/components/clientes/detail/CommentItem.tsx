import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ClienteComment, useDeleteClienteComment } from "@/hooks/useClienteComments";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MarkdownPreview } from "@/components/ui/markdown-editor";

interface CommentItemProps {
  comment: ClienteComment;
  currentUserId: string | null;
}

// Process mentions in content for highlighting
function processContentWithMentions(content: string, mentions: string[]): string {
  let processedContent = content;
  mentions.forEach((mention) => {
    const regex = new RegExp(`@${mention}\\b`, "g");
    processedContent = processedContent.replace(
      regex,
      `**@${mention}**`
    );
  });
  return processedContent;
}

export function CommentItem({ comment, currentUserId }: CommentItemProps) {
  const deleteComment = useDeleteClienteComment();
  const isOwner = currentUserId === comment.user_id;

  const handleDelete = () => {
    deleteComment.mutate({ commentId: comment.id, clienteId: comment.cliente_id });
  };

  const processedContent = processContentWithMentions(comment.content, comment.mentions);

  return (
    <div className="flex gap-3 group">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
          {comment.user_id.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Usuário</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
              disabled={deleteComment.isPending}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          <MarkdownPreview content={processedContent} emptyMessage="" />
        </div>
      </div>
    </div>
  );
}
