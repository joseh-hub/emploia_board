import { useTarefaActivities } from "@/hooks/useTarefaActivities";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Activity, 
  Edit3, 
  MoveRight, 
  Star, 
  MessageSquare,
  Plus
} from "lucide-react";

interface TarefaActivityFeedProps {
  tarefaId: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create: <Plus className="h-3.5 w-3.5" />,
  update: <Edit3 className="h-3.5 w-3.5" />,
  move: <MoveRight className="h-3.5 w-3.5" />,
  prioritize: <Star className="h-3.5 w-3.5" />,
  comment: <MessageSquare className="h-3.5 w-3.5" />,
};

const ACTION_LABELS: Record<string, string> = {
  create: "criou a tarefa",
  update: "atualizou",
  move: "moveu para",
  prioritize: "alterou prioridade",
  comment: "comentou",
};

export function TarefaActivityFeed({ tarefaId }: TarefaActivityFeedProps) {
  const { data: activities, isLoading } = useTarefaActivities(tarefaId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-pulse text-muted-foreground text-sm">
          Carregando atividades...
        </div>
      </div>
    );
  }

  if (!activities?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Activity className="h-8 w-8 mb-2 opacity-20" />
        <p className="text-sm">Nenhuma atividade registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted flex-shrink-0">
            {ACTION_ICONS[activity.action_type] || <Activity className="h-3.5 w-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">
                {ACTION_LABELS[activity.action_type] || activity.action_type}
              </span>
              {activity.field_name && (
                <span> {activity.field_name}</span>
              )}
              {activity.new_value && (
                <span className="text-foreground"> {activity.new_value}</span>
              )}
            </p>
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
  );
}
