import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { MentionInput, MentionUser } from "@/components/clientes/detail/MentionInput";
import { MarkdownPreview } from "@/components/ui/markdown-editor";
import {
  useTarefaComments,
  useCreateTarefaComment,
  useDeleteTarefaComment,
} from "@/hooks/useTarefaComments";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TarefaCommentsSectionProps {
  tarefaId: string;
}

// Process mentions in content for highlighting
function processContentWithMentions(content: string, mentions: string[] | null): string {
  if (!mentions?.length) return content;
  let processedContent = content;
  mentions.forEach((mention) => {
    const regex = new RegExp(`@${mention}\\b`, "g");
    processedContent = processedContent.replace(regex, `**@${mention}**`);
  });
  return processedContent;
}

export function TarefaCommentsSection({ tarefaId }: TarefaCommentsSectionProps) {
  const { data: comments, isLoading } = useTarefaComments(tarefaId);
  const { data: profiles } = useProfiles();
  const createComment = useCreateTarefaComment();
  const deleteComment = useDeleteTarefaComment();
  const { user } = useAuth();

  // Map profiles to MentionUser format
  const users: MentionUser[] = (profiles || []).map(p => ({
    id: p.id,
    name: p.full_name || p.email?.split("@")[0] || "Usuário",
    email: p.email,
    avatar_url: p.avatar_url,
  }));

  const handleSubmit = (content: string, mentions: string[]) => {
    if (!content.trim()) return;
    createComment.mutate({
      tarefaId,
      content,
      mentions,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">
          Carregando comentários...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New Comment Input */}
      <MentionInput
        onSubmit={handleSubmit}
        isLoading={createComment.isPending}
        users={users}
        placeholder="Escreva um comentário... Use @ para mencionar (Markdown suportado)"
      />

      {/* Comments List */}
      <div className="space-y-3">
        {comments?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum comentário ainda
          </p>
        )}

        {comments?.map((comment) => {
          const initials = comment.user_id?.slice(0, 2).toUpperCase() || "??";
          const isOwner = user?.id === comment.user_id;
          const processedContent = processContentWithMentions(comment.content, comment.mentions);

          return (
            <div
              key={comment.id}
              className="flex gap-3 p-3 rounded-lg bg-muted/30 border group"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        deleteComment.mutate({
                          commentId: comment.id,
                          tarefaId,
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="text-sm mt-1">
                  <MarkdownPreview content={processedContent} emptyMessage="" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
