import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Zap,
  Plus,
  MoreHorizontal,
  Trash2,
  Power,
  Pencil,
  Copy,
  Search,
  Filter,
  Globe,
  Target,
  MessageSquare,
} from "lucide-react";
import {
  useAutomations,
  useToggleAutomation,
  useDeleteAutomation,
  useAutomationLogs,
  Automation,
  TriggerType,
  ActionType,
  ScopeType,
} from "@/hooks/useAutomations";
import { useDuplicateAutomation } from "@/hooks/useDuplicateAutomation";
import { AutomationForm } from "@/components/automations/AutomationForm";
import { AutomationLogsList } from "@/components/automations/AutomationLogsList";
import { AutomationDashboard } from "@/components/automations/AutomationDashboard";
import { WebhookInboundSection } from "@/components/automations/WebhookInboundSection";
import { DailyCheckinTab } from "@/components/automations/DailyCheckinTab";
import { cn } from "@/lib/utils";

const triggerLabels: Record<TriggerType, string> = {
  status_change: "Quando status mudar",
  due_date: "Quando prazo vencer",
  assignment: "Quando for atribuído",
  created: "Quando for criado",
  completed: "Quando for concluído",
  card_done: "Quando card for marcado Done",
};

const actionLabels: Record<ActionType, string> = {
  webhook: "Enviar Webhook",
  notification: "Criar Notificação",
  move_column: "Mover para Coluna",
  assign: "Atribuir a Usuário",
  update_field: "Atualizar Campo",
};

export default function Automacoes() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<boolean | null>(null);
  const [filterScope, setFilterScope] = useState<ScopeType | null>(null);

  const { data: automations, isLoading } = useAutomations();

  const filteredAutomations = automations?.filter((a) => {
    const matchesSearch = !searchQuery || 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === null || a.is_active === filterStatus;
    const matchesScope = filterScope === null || a.scope === filterScope;
    return matchesSearch && matchesStatus && matchesScope;
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Automações">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Automação</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Automação</DialogTitle>
            </DialogHeader>
            <AutomationForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </TopBar>

      {/* Edit Modal */}
      <Dialog open={!!editingAutomation} onOpenChange={(open) => !open && setEditingAutomation(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Automação</DialogTitle>
          </DialogHeader>
          {editingAutomation && (
            <AutomationForm
              initialData={editingAutomation}
              onSuccess={() => setEditingAutomation(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex-1 min-h-0 overflow-auto p-4 lg:p-6 space-y-4">
        {/* Dashboard */}
        <AutomationDashboard />

        {/* Tabs */}
        <Tabs defaultValue="automations" className="w-full">
          <TabsList>
            <TabsTrigger value="automations" className="gap-1.5">
              <Zap className="h-4 w-4" />
              Automações
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-1.5">
              <Globe className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="checkin" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Check-in Diário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="automations" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar automações..."
                  className="pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Filter className="h-4 w-4" />
                    {filterStatus === true ? "Ativas" : filterStatus === false ? "Inativas" : "Status"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus(null)}>Todos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus(true)}>Apenas Ativas</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus(false)}>Apenas Inativas</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Target className="h-4 w-4" />
                    {filterScope === "global" ? "Global" : filterScope === "board" ? "Board" : "Escopo"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterScope(null)}>Todos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterScope("global")}>Global</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterScope("board")}>Por Board</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-muted-foreground">Carregando automações...</div>
              </div>
            ) : filteredAutomations && filteredAutomations.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {filteredAutomations.map((automation) => (
                  <AutomationCard 
                    key={automation.id} 
                    automation={automation}
                    onEdit={() => setEditingAutomation(automation)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Zap className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">
                  {searchQuery || filterStatus !== null || filterScope !== null
                    ? "Nenhuma automação encontrada"
                    : "Nenhuma automação criada"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {searchQuery || filterStatus !== null || filterScope !== null
                    ? "Tente ajustar os filtros de busca."
                    : "Automatize tarefas repetitivas como enviar webhooks, criar notificações ou mover tarefas automaticamente."}
                </p>
                {!searchQuery && filterStatus === null && filterScope === null && (
                  <Button className="mt-4 gap-2" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Criar Automação
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="webhooks" className="mt-4">
            <WebhookInboundSection />
          </TabsContent>

          <TabsContent value="checkin">
            <DailyCheckinTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AutomationCard({ 
  automation, 
  onEdit 
}: { 
  automation: Automation; 
  onEdit: () => void;
}) {
  const toggleAutomation = useToggleAutomation();
  const deleteAutomation = useDeleteAutomation();
  const duplicateAutomation = useDuplicateAutomation();
  const { data: logs } = useAutomationLogs(automation.id);

  const executionCount = logs?.length || 0;

  const getConfigSummary = () => {
    const triggerConfig = automation.trigger_config as Record<string, unknown> || {};
    const actionConfig = automation.action_config as Record<string, unknown> || {};
    
    const parts: string[] = [];
    
    // Trigger details
    if (triggerConfig.from_status || triggerConfig.to_status) {
      parts.push(`${triggerConfig.from_status || '*'} → ${triggerConfig.to_status || '*'}`);
    }
    if (triggerConfig.timing) {
      parts.push(`Timing: ${triggerConfig.timing}`);
    }
    
    // Action details
    if (actionConfig.url) {
      const url = actionConfig.url as string;
      parts.push(`URL: ${url.substring(0, 30)}${url.length > 30 ? '...' : ''}`);
    }
    if (actionConfig.column_id) {
      parts.push(`Coluna definida`);
    }
    
    return parts;
  };

  const configSummary = getConfigSummary();

  return (
    <Card className={cn("group", !automation.is_active && "opacity-60")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={automation.is_active ? "default" : "secondary"} className="text-xs">
                {automation.is_active ? "Ativa" : "Inativa"}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                {automation.scope === "board" ? (
                  <>
                    <Target className="h-3 w-3" />
                    Board
                  </>
                ) : (
                  <>
                    <Globe className="h-3 w-3" />
                    Global
                  </>
                )}
              </Badge>
              {executionCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {executionCount} execuções
                </Badge>
              )}
            </div>
            <CardTitle className="text-base mt-1 truncate">{automation.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                toggleAutomation.mutate({
                  id: automation.id,
                  isActive: !automation.is_active,
                })
              }
            >
              <Power
                className={cn(
                  "h-4 w-4",
                  automation.is_active ? "text-success" : "text-muted-foreground"
                )}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => duplicateAutomation.mutate(automation)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteAutomation.mutate(automation.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {automation.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {automation.description}
          </p>
        )}

        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Quando:</span>
            <span className="font-medium">{triggerLabels[automation.trigger_type]}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Então:</span>
            <span className="font-medium">{actionLabels[automation.action_type]}</span>
          </div>
        </div>

        {configSummary.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {configSummary.map((item, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">
                {item}
              </Badge>
            ))}
          </div>
        )}

        <Separator />
        
        <AutomationLogsList logs={logs || []} />
      </CardContent>
    </Card>
  );
}
