import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AutomationLog } from "@/hooks/useAutomations";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AutomationLogsListProps {
  logs: AutomationLog[];
}

export function AutomationLogsList({ logs }: AutomationLogsListProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (logs.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-2">
        Nenhuma execução registrada
      </p>
    );
  }

  const successCount = logs.filter((l) => l.status === "success").length;
  const failCount = logs.filter((l) => l.status === "failed").length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">Execuções:</span>
          {successCount > 0 && (
            <span className="flex items-center gap-1 text-success">
              <CheckCircle className="h-3 w-3" />
              {successCount}
            </span>
          )}
          {failCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <XCircle className="h-3 w-3" />
              {failCount}
            </span>
          )}
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
            {isOpen ? (
              <>
                Ocultar <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Ver Logs <ChevronDown className="h-3 w-3" />
              </>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <ScrollArea className="max-h-48 mt-2">
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
}

function LogItem({ log }: { log: AutomationLog }) {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: "text-success",
      badge: "default" as const,
      label: "Sucesso",
    },
    failed: {
      icon: XCircle,
      color: "text-destructive",
      badge: "destructive" as const,
      label: "Falha",
    },
    pending: {
      icon: Clock,
      color: "text-warning",
      badge: "secondary" as const,
      label: "Pendente",
    },
  };

  const config = statusConfig[log.status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-xs">
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={config.badge} className="text-[10px] px-1.5 py-0">
            {config.label}
          </Badge>
          <span className="text-muted-foreground">
            {format(new Date(log.executed_at), "dd/MM HH:mm", { locale: ptBR })}
          </span>
        </div>
        {log.error_message && (
          <p className="text-destructive truncate">{log.error_message}</p>
        )}
        {log.trigger_data && Object.keys(log.trigger_data).length > 0 && (
          <p className="text-muted-foreground truncate">
            Trigger: {JSON.stringify(log.trigger_data)}
          </p>
        )}
      </div>
    </div>
  );
}
