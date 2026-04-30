import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Trash2 } from "lucide-react";
import { useProjetoComments, useCreateProjetoComment, useDeleteProjetoComment } from "@/hooks/useProjetoComments";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { MentionInput, MentionUser } from "@/components/clientes/detail/MentionInput";
import { MarkdownPreview } from "@/components/ui/markdown-editor";

interface ProjetoCommentsSectionProps {
  projetoId: string;
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

export function ProjetoCommentsSection({ projetoId }: ProjetoCommentsSectionProps) {
  const { user } = useAuth();
  
  const { data: comments, isLoading } = useProjetoComments(projetoId);
  const { data: profiles } = useProfiles();
  const createComment = useCreateProjetoComment();
  const deleteComment = useDeleteProjetoComment();

  // Map profiles to MentionUser format
  const users: MentionUser[] = (profiles || []).map(p => ({
    id: p.id,
    name: p.full_name || p.email?.split("@")[0] || "Usuário",
    email: p.email,
    avatar_url: p.avatar_url,
  }));

  const handleSubmit = async (content: string, mentions: string[]) => {
    await createComment.mutateAsync({
      projetoId,
      content,
      mentions,
    });
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment.mutateAsync({ commentId, projetoId });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add comment with mentions */}
      <MentionInput
        onSubmit={handleSubmit}
        isLoading={createComment.isPending}
        users={users}
        placeholder="Adicione um comentário... Use @ para mencionar (Markdown suportado)"
      />

      {!comments?.length ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <MessageCircle className="h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">Nenhum comentário ainda</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-4 pr-4">
            {comments.map((comment) => {
              const isOwner = user?.id === comment.user_id;
              const processedContent = processContentWithMentions(comment.content, comment.mentions);

              return (
                <div key={comment.id} className="flex gap-3 group">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">Usuário</p>
                      <div className="flex items-center gap-2">
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
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <MarkdownPreview content={processedContent} emptyMessage="" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
