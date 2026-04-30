import { useAutomations, useAutomationLogs } from "@/hooks/useAutomations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Play, CheckCircle, XCircle, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AutomationDashboard() {
  const { data: automations } = useAutomations();
  const { data: logs } = useAutomationLogs();

  const activeCount = automations?.filter((a) => a.is_active).length || 0;
  const totalExecutions = logs?.length || 0;
  const successCount = logs?.filter((l) => l.status === "success").length || 0;
  const failCount = logs?.filter((l) => l.status === "failed").length || 0;

  const recentLogs = logs?.slice(0, 5) || [];

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Zap className="h-4 w-4" />}
          label="Ativas"
          value={activeCount}
          color="text-primary"
        />
        <StatCard
          icon={<Play className="h-4 w-4" />}
          label="Execuções"
          value={totalExecutions}
          color="text-muted-foreground"
        />
        <StatCard
          icon={<CheckCircle className="h-4 w-4" />}
          label="Sucessos"
          value={successCount}
          color="text-success"
        />
        <StatCard
          icon={<XCircle className="h-4 w-4" />}
          label="Falhas"
          value={failCount}
          color="text-destructive"
        />
      </div>

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Logs Recentes</span>
            </div>
            <ScrollArea className="max-h-32">
              <div className="space-y-1">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-2 text-xs py-1"
                  >
                    {log.status === "success" ? (
                      <CheckCircle className="h-3 w-3 text-success shrink-0" />
                    ) : log.status === "failed" ? (
                      <XCircle className="h-3 w-3 text-destructive shrink-0" />
                    ) : (
                      <Clock className="h-3 w-3 text-warning shrink-0" />
                    )}
                    <span className="flex-1 truncate">
                      {log.error_message || "Execução bem-sucedida"}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(log.executed_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className={color}>{icon}</div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
