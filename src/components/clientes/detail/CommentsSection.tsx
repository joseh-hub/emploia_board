import { useEffect, useState } from "react";
import { useClienteComments, useAddClienteComment } from "@/hooks/useClienteComments";
import { useProfiles } from "@/hooks/useProfiles";
import { CommentItem } from "./CommentItem";
import { MentionInput, MentionUser } from "./MentionInput";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentsSectionProps {
  clienteId: number;
}

export function CommentsSection({ clienteId }: CommentsSectionProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { data: comments, isLoading } = useClienteComments(clienteId);
  const { data: profiles } = useProfiles();
  const addComment = useAddClienteComment();

  // Map profiles to MentionUser format
  const users: MentionUser[] = (profiles || []).map(p => ({
    id: p.id,
    name: p.full_name || p.email?.split("@")[0] || "Usuário",
    email: p.email,
    avatar_url: p.avatar_url,
  }));

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  const handleSubmit = async (content: string, mentions: string[]) => {
    await addComment.mutateAsync({ clienteId, content, mentions });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Comentários ({comments?.length || 0})
      </h4>

      {/* Comments list */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        )}
      </div>

      {/* Add comment */}
      <MentionInput
        onSubmit={handleSubmit}
        isLoading={addComment.isPending}
        users={users}
      />
    </div>
  );
}
