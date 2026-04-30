import { useClienteActivities, formatFieldName, formatActionType } from "@/hooks/useClienteActivities";
import { Activity, User, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityFeedProps {
  clienteId: number;
}

export function ActivityFeed({ clienteId }: ActivityFeedProps) {
  const { data: activities, isLoading } = useClienteActivities(clienteId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
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
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhuma atividade registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm">
              <span className="font-medium">{formatActionType(activity.action_type)}</span>
              {activity.field_name && (
                <span className="text-muted-foreground">
                  {" "}- {formatFieldName(activity.field_name)}
                </span>
              )}
            </div>
            
            {(activity.old_value || activity.new_value) && (
              <div className="text-sm text-muted-foreground mt-1">
                {activity.old_value && activity.new_value ? (
                  <>
                    <span className="line-through">{activity.old_value}</span>
                    <span className="mx-1">→</span>
                    <span className="text-foreground">{activity.new_value}</span>
                  </>
                ) : activity.new_value ? (
                  <span>Definido como: <span className="text-foreground">{activity.new_value}</span></span>
                ) : null}
              </div>
            )}
            
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
            )}
            
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
