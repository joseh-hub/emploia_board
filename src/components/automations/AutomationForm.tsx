import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Automation,
  TriggerType,
  ActionType,
  EntityType,
  ScopeType,
  useCreateAutomation,
  useUpdateAutomation,
} from "@/hooks/useAutomations";
import { useTarefaBoardColumns } from "@/hooks/useTarefaBoardColumns";
import { useCustomBoardColumns } from "@/hooks/useCustomBoardColumns";
import { useBoardColumns } from "@/hooks/useBoardColumns";
import { useProjetoBoardColumns } from "@/hooks/useProjetoBoardColumns";
import { useProfiles } from "@/hooks/useProfiles";
import { ScopeSelector } from "./ScopeSelector";
import { Json } from "@/integrations/supabase/types";
import { Zap } from "lucide-react";

interface AutomationFormProps {
  initialData?: Automation;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_progresso", label: "Em Progresso" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

const DUE_DATE_OPTIONS = [
  { value: "before_3", label: "3 dias antes" },
  { value: "before_1", label: "1 dia antes" },
  { value: "on_day", label: "No dia" },
  { value: "after_1", label: "1 dia depois" },
];

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const TRIGGER_LABELS: Record<TriggerType, string> = {
  status_change: "Status mudou",
  created: "Foi criado",
  completed: "Foi concluído",
  assignment: "Foi atribuído",
  due_date: "Prazo vencendo",
  card_done: "Card marcado como Done",
};

const ACTION_LABELS: Record<ActionType, string> = {
  notification: "Criar Notificação",
  webhook: "Enviar Webhook",
  move_column: "Mover para Coluna",
  assign: "Atribuir a Usuário",
  update_field: "Atualizar Campo",
};

export function AutomationForm({ initialData, onSuccess }: AutomationFormProps) {
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [entityType, setEntityType] = useState<EntityType>(
    (initialData?.entity_type as EntityType) || "tarefa"
  );
  const [triggerType, setTriggerType] = useState<TriggerType>(
    (initialData?.trigger_type as TriggerType) || "card_done"
  );
  const [actionType, setActionType] = useState<ActionType>(
    (initialData?.action_type as ActionType) || "notification"
  );
  const [scope, setScope] = useState<ScopeType>(
    (initialData?.scope as ScopeType) || "global"
  );
  const [boardId, setBoardId] = useState<string | null>(initialData?.board_id || null);

  // Trigger configs
  const [fromStatus, setFromStatus] = useState("");
  const [toStatus, setToStatus] = useState("");
  const [dueDateTiming, setDueDateTiming] = useState("on_day");

  // Action configs
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookMethod, setWebhookMethod] = useState("POST");
  const [webhookHeaders, setWebhookHeaders] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [targetColumnId, setTargetColumnId] = useState("");
  const [assignUserId, setAssignUserId] = useState("");

  // Fetch columns based on selected board type
  const { data: tarefaColumns } = useTarefaBoardColumns();
  const { data: clienteColumns } = useBoardColumns();
  const { data: projetoColumns } = useProjetoBoardColumns();
  const { data: customColumns } = useCustomBoardColumns(
    scope === "board" && boardId && !["clientes", "projetos", "tarefas"].includes(boardId)
      ? boardId
      : undefined
  );
  const { data: profiles } = useProfiles();

  const createAutomation = useCreateAutomation();
  const updateAutomation = useUpdateAutomation();

  // Get columns based on selected board
  const availableColumns = useMemo(() => {
    if (scope === "global") {
      return [];
    }
    switch (boardId) {
      case "tarefas":
        return tarefaColumns || [];
      case "clientes":
        return clienteColumns || [];
      case "projetos":
        return projetoColumns || [];
      default:
        // Custom board
        return customColumns || [];
    }
  }, [scope, boardId, tarefaColumns, clienteColumns, projetoColumns, customColumns]);

  // Load initial config values
  useEffect(() => {
    if (initialData) {
      const triggerConfig = initialData.trigger_config as Record<string, unknown> || {};
      const actionConfig = initialData.action_config as Record<string, unknown> || {};

      // Trigger configs
      setFromStatus((triggerConfig.from_status as string) || "");
      setToStatus((triggerConfig.to_status as string) || "");
      setDueDateTiming((triggerConfig.timing as string) || "on_day");

      // Action configs
      setWebhookUrl((actionConfig.url as string) || "");
      setWebhookMethod((actionConfig.method as string) || "POST");
      setWebhookHeaders(
        actionConfig.headers ? JSON.stringify(actionConfig.headers, null, 2) : ""
      );
      setNotificationTitle((actionConfig.title as string) || "");
      setNotificationMessage((actionConfig.message as string) || "");
      setTargetColumnId((actionConfig.column_id as string) || "");
      setAssignUserId((actionConfig.user_id as string) || "");
    }
  }, [initialData]);

  const buildTriggerConfig = (): Json => {
    const config: Record<string, unknown> = {};

    switch (triggerType) {
      case "status_change":
        if (fromStatus) config.from_status = fromStatus;
        if (toStatus) config.to_status = toStatus;
        break;
      case "due_date":
        config.timing = dueDateTiming;
        break;
    }

    return config as Json;
  };

  const buildActionConfig = (): Json => {
    const config: Record<string, unknown> = {};

    switch (actionType) {
      case "webhook":
        config.url = webhookUrl;
        config.method = webhookMethod;
        if (webhookHeaders.trim()) {
          try {
            config.headers = JSON.parse(webhookHeaders);
          } catch {
            // Invalid JSON, ignore
          }
        }
        break;
      case "notification":
        if (notificationTitle) config.title = notificationTitle;
        if (notificationMessage) config.message = notificationMessage;
        break;
      case "move_column":
        if (targetColumnId) config.column_id = targetColumnId;
        break;
      case "assign":
        if (assignUserId) config.user_id = assignUserId;
        break;
    }

    return config as Json;
  };

  const getPreviewText = (): string => {
    const triggerText = TRIGGER_LABELS[triggerType] || triggerType;
    const actionText = ACTION_LABELS[actionType] || actionType;
    const scopeText = scope === "global" ? "em todos os boards" : boardId ? `no board selecionado` : "";
    
    return `Quando ${triggerText.toLowerCase()} ${scopeText}, então ${actionText.toLowerCase()}.`;
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (actionType === "webhook" && !webhookUrl.trim()) return;
    if (scope === "board" && !boardId) return;

    const triggerConfig = buildTriggerConfig();
    const actionConfig = buildActionConfig();

    if (isEditing && initialData) {
      updateAutomation.mutate(
        {
          id: initialData.id,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
            entity_type: entityType,
            trigger_type: triggerType,
            action_type: actionType,
            trigger_config: triggerConfig,
            action_config: actionConfig,
            scope,
            board_id: scope === "board" ? boardId : null,
          },
        },
        { onSuccess }
      );
    } else {
      createAutomation.mutate(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          entity_type: entityType,
          trigger_type: triggerType,
          action_type: actionType,
          trigger_config: triggerConfig,
          action_config: actionConfig,
          scope,
          board_id: scope === "board" ? boardId : null,
        },
        { onSuccess }
      );
    }
  };

  const isValid =
    name.trim() &&
    (actionType !== "webhook" || webhookUrl.trim()) &&
    (actionType !== "move_column" || targetColumnId) &&
    (scope !== "board" || boardId);

  return (
    <ScrollArea className="max-h-[70vh]">
      <div className="space-y-5 pr-4">
        {/* Step 1: Scope */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-muted">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Passo 1: Escopo
          </p>
          <ScopeSelector
            scope={scope}
            boardId={boardId}
            onScopeChange={setScope}
            onBoardChange={setBoardId}
          />
        </div>

        {/* Step 2: Trigger */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-muted">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Passo 2: Gatilho (Quando)
          </p>
          <Select value={triggerType} onValueChange={(v) => setTriggerType(v as TriggerType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card_done">Card marcado como Done ⭐</SelectItem>
              <SelectItem value="created">For criado</SelectItem>
              <SelectItem value="status_change">Status mudar</SelectItem>
              <SelectItem value="completed">For concluído</SelectItem>
              <SelectItem value="assignment">For atribuído</SelectItem>
              <SelectItem value="due_date">Prazo vencer</SelectItem>
            </SelectContent>
          </Select>

          {/* Trigger Config: Status Change */}
          {triggerType === "status_change" && (
            <div className="grid grid-cols-2 gap-2 pl-3 border-l-2 border-primary/30">
              <div className="space-y-1">
                <Label className="text-xs">De Status (opcional)</Label>
                <Select value={fromStatus || "__any__"} onValueChange={(v) => setFromStatus(v === "__any__" ? "" : v)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">Qualquer</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Para Status (opcional)</Label>
                <Select value={toStatus || "__any__"} onValueChange={(v) => setToStatus(v === "__any__" ? "" : v)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">Qualquer</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Trigger Config: Due Date */}
          {triggerType === "due_date" && (
            <div className="pl-3 border-l-2 border-primary/30 space-y-1">
              <Label className="text-xs">Quando</Label>
              <Select value={dueDateTiming} onValueChange={setDueDateTiming}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DUE_DATE_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Step 3: Action */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-muted">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Passo 3: Ação (Então)
          </p>
          <Select value={actionType} onValueChange={(v) => setActionType(v as ActionType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="notification">Criar Notificação</SelectItem>
              <SelectItem value="webhook">Enviar Webhook</SelectItem>
              <SelectItem value="move_column">Mover para Coluna</SelectItem>
              <SelectItem value="assign">Atribuir a Usuário</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Config: Webhook */}
          {actionType === "webhook" && (
            <div className="pl-3 border-l-2 border-primary/30 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">URL do Webhook *</Label>
                <Input
                  placeholder="https://..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Método HTTP</Label>
                <Select value={webhookMethod} onValueChange={setWebhookMethod}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HTTP_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Headers (JSON)</Label>
                <Textarea
                  placeholder='{"Content-Type": "application/json"}'
                  value={webhookHeaders}
                  onChange={(e) => setWebhookHeaders(e.target.value)}
                  rows={2}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Action Config: Notification */}
          {actionType === "notification" && (
            <div className="pl-3 border-l-2 border-primary/30 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Título da Notificação</Label>
                <Input
                  placeholder="Ex: Tarefa concluída"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Mensagem</Label>
                <Textarea
                  placeholder="Ex: A tarefa {titulo} foi concluída."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Action Config: Move Column */}
          {actionType === "move_column" && (
            <div className="pl-3 border-l-2 border-primary/30 space-y-1">
              <Label className="text-xs">Coluna de Destino *</Label>
              <Select 
                value={targetColumnId} 
                onValueChange={setTargetColumnId}
                disabled={scope === "global" || !boardId}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={
                    scope === "global" 
                      ? "Selecione um board primeiro" 
                      : !boardId 
                        ? "Selecione um board primeiro"
                        : availableColumns.length === 0
                          ? "Carregando colunas..."
                          : "Selecione uma coluna"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: col.color || "#6366f1" }} 
                        />
                        <span>{col.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {scope === "global" && (
                <p className="text-xs text-amber-600">
                  Selecione "Board Específico" no Passo 1 para configurar a coluna de destino.
                </p>
              )}
            </div>
          )}

          {/* Action Config: Assign */}
          {actionType === "assign" && (
            <div className="pl-3 border-l-2 border-primary/30 space-y-1">
              <Label className="text-xs">Atribuir a</Label>
              <Select value={assignUserId} onValueChange={setAssignUserId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px] bg-muted">
                            {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{profile.full_name || profile.email || "Usuário"}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Step 4: Name */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-muted">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Passo 4: Nomear
          </p>
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Automação *</Label>
            <Input
              id="name"
              placeholder="Ex: Notificar ao concluir tarefa"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              placeholder="Descrição da automação"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Preview */}
        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground italic">{getPreviewText()}</span>
          </div>
        </Card>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!isValid || createAutomation.isPending || updateAutomation.isPending}
        >
          {isEditing ? "Salvar Alterações" : "Criar Automação"}
        </Button>
      </div>
    </ScrollArea>
  );
}
