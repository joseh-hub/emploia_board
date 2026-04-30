import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Activity,
  Send,
  Clock,
  CheckCircle2,
  User,
  Tag,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTarefaComments, useCreateTarefaComment } from "@/hooks/useTarefaComments";
import { useTarefaActivities } from "@/hooks/useTarefaActivities";
import { useAuth } from "@/contexts/AuthContext";

interface TaskActivityTimelineProps {
  tarefaId: string;
}

type TimelineItem = {
  id: string;
  type: "comment" | "activity";
  content: string;
  createdAt: string;
  userId?: string;
  actionType?: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
};

export function TaskActivityTimeline({ tarefaId }: TaskActivityTimelineProps) {
  const [filter, setFilter] = useState<"all" | "comments" | "activity">("all");
  const [newComment, setNewComment] = useState("");

  const { user } = useAuth();
  const { data: comments = [] } = useTarefaComments(tarefaId);
  const { data: activities = [] } = useTarefaActivities(tarefaId);
  const createComment = useCreateTarefaComment();

  // Merge and sort timeline items
  const timelineItems: TimelineItem[] = [
    ...comments.map((c) => ({
      id: c.id,
      type: "comment" as const,
      content: c.content,
      createdAt: c.created_at || "",
      userId: c.user_id,
    })),
    ...activities.map((a) => ({
      id: a.id,
      type: "activity" as const,
      content: a.description || "",
      createdAt: a.created_at,
      userId: a.user_id,
      actionType: a.action_type,
      fieldName: a.field_name,
      oldValue: a.old_value,
      newValue: a.new_value,
    })),
  ]
    .filter((item) => {
      if (filter === "comments") return item.type === "comment";
      if (filter === "activity") return item.type === "activity";
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmitComment = () => {
    if (!newComment.trim() || !user) return;
    createComment.mutate({
      tarefaId: tarefaId,
      content: newComment.trim(),
    });
    setNewComment("");
  };

  const getActivityIcon = (actionType?: string) => {
    switch (actionType) {
      case "status_change":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "assignment_change":
        return <User className="h-3.5 w-3.5" />;
      case "tag_added":
      case "tag_removed":
        return <Tag className="h-3.5 w-3.5" />;
      default:
        return <Activity className="h-3.5 w-3.5" />;
    }
  };

  const formatActivityMessage = (item: TimelineItem) => {
    if (item.actionType === "status_change") {
      return (
        <span className="text-muted-foreground">
          alterou status de{" "}
          <Badge variant="outline" className="mx-1 text-xs">
            {item.oldValue || "—"}
          </Badge>
          <ArrowRight className="h-3 w-3 inline mx-1" />
          <Badge variant="outline" className="mx-1 text-xs">
            {item.newValue || "—"}
          </Badge>
        </span>
      );
    }
    if (item.actionType === "assignment_change") {
      return (
        <span className="text-muted-foreground">
          atribuiu a tarefa para{" "}
          <span className="font-medium text-foreground">{item.newValue || "—"}</span>
        </span>
      );
    }
    return <span className="text-muted-foreground">{item.content || "fez uma alteração"}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#3F1757]/10 flex items-center justify-center text-[#CBC5EA]">
            <MessageSquare className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-sm text-zinc-100">Atividade</h3>
          <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700">
            {timelineItems.length}
          </Badge>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="h-7 p-0.5 bg-zinc-800 border border-zinc-700">
            <TabsTrigger value="all" className="text-xs h-6 px-2">
              Tudo
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs h-6 px-2">
              Comentários
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs h-6 px-2">
              Histórico
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Comment Input */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Escreva um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none text-sm bg-zinc-900/40 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-[#3F1757]/30 focus-visible:bg-zinc-900"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmitComment();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500">
              Ctrl+Enter para enviar
            </span>
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createComment.isPending}
              className={cn(
                "gap-1.5",
                newComment.trim()
                  ? "bg-[#ED6A5A] text-white hover:bg-[#e05a4a]"
                  : "opacity-60 bg-zinc-700 text-zinc-400 cursor-not-allowed"
              )}
            >
              <Send className="h-3.5 w-3.5" />
              Comentar
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {timelineItems.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-sm">
            Nenhuma atividade ainda.
          </div>
        ) : (
          timelineItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex gap-3 py-3",
                index !== timelineItems.length - 1 && "border-b border-border/50"
              )}
            >
              {/* Avatar/Icon */}
              <div className="shrink-0">
                {item.type === "comment" ? (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {item.userId?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    {getActivityIcon(item.actionType)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {item.type === "comment" ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">Usuário</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">Sistema</span>
                    {formatActivityMessage(item)}
                    <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
