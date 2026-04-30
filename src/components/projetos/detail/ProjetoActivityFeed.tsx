import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useProjetoActivities, formatProjetoFieldName, formatProjetoActionType } from "@/hooks/useProjetoActivities";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";

interface ProjetoActivityFeedProps {
  projetoId: string;
}

export function ProjetoActivityFeed({ projetoId }: ProjetoActivityFeedProps) {
  const { data: activities, isLoading } = useProjetoActivities(projetoId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Activity className="h-10 w-10 mb-2 opacity-50" />
        <p className="text-sm">Nenhuma atividade registrada</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secondary text-xs">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">Usuário</span>{" "}
                <span className="text-muted-foreground">
                  {formatProjetoActionType(activity.action_type)}
                </span>
                {activity.field_name && (
                  <span className="text-muted-foreground">
                    {" "}{formatProjetoFieldName(activity.field_name)}
                  </span>
                )}
              </p>
              
              {activity.old_value && activity.new_value && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  <span className="line-through">{activity.old_value}</span>
                  {" → "}
                  <span className="font-medium text-foreground">{activity.new_value}</span>
                </p>
              )}
              
              {activity.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.description}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
