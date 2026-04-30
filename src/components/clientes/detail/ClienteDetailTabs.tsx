import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Cliente } from "@/hooks/useClientes";
import { DescriptionEditor } from "./DescriptionEditor";
import { CommentsSection } from "./CommentsSection";
import { ActivityFeed } from "./ActivityFeed";
import { ClienteChecklistSection } from "./ClienteChecklistSection";
import { Building, Calendar, DollarSign, Clock, Users, FileText, MessageSquare, Activity, ListChecks } from "lucide-react";

interface ClienteDetailTabsProps {
  cliente: Cliente & { description?: string | null };
}

export function ClienteDetailTabs({ cliente }: ClienteDetailTabsProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="details" className="gap-2">
          <FileText className="h-3 w-3" />
          Detalhes
        </TabsTrigger>
        <TabsTrigger value="checklist" className="gap-2">
          <ListChecks className="h-3 w-3" />
          Checklist
        </TabsTrigger>
        <TabsTrigger value="comments" className="gap-2">
          <MessageSquare className="h-3 w-3" />
          Comentários
        </TabsTrigger>
        <TabsTrigger value="activity" className="gap-2">
          <Activity className="h-3 w-3" />
          Atividade
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="mt-4 space-y-6">
        {/* Info Grid */}
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita Mensal</p>
              <p className="font-medium">{formatCurrency(cliente.receita)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horas Alocadas</p>
              <p className="font-medium">{cliente.horas}h</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Início</p>
              <p className="font-medium">{formatDate(cliente.data_inicio)}</p>
            </div>
          </div>

          {cliente.dia_pagamento && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dia de Pagamento</p>
                <p className="font-medium">Dia {cliente.dia_pagamento}</p>
              </div>
            </div>
          )}

          {cliente.cnpj && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Building className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="font-medium">{cliente.cnpj}</p>
              </div>
            </div>
          )}

          {cliente.responsavelTecnico?.length ? (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Responsáveis</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {cliente.responsavelTecnico.map((resp) => (
                    <Badge key={resp} variant="secondary">
                      {resp}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <Separator />

        {/* Health Scores */}
        <div>
          <h4 className="text-sm font-medium mb-3">Health Scores</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{cliente.hs_resultado || 0}</p>
              <p className="text-xs text-muted-foreground">Resultado</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{cliente.hs_suporte || 0}</p>
              <p className="text-xs text-muted-foreground">Suporte</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{cliente.hs_inadimplencia || 0}</p>
              <p className="text-xs text-muted-foreground">Inadimplência</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Description Editor */}
        <DescriptionEditor 
          clienteId={cliente.id} 
          initialDescription={cliente.description || null}
        />
      </TabsContent>

      <TabsContent value="checklist" className="mt-4">
        <ClienteChecklistSection clienteId={cliente.id} />
      </TabsContent>

      <TabsContent value="comments" className="mt-4">
        <CommentsSection clienteId={cliente.id} />
      </TabsContent>

      <TabsContent value="activity" className="mt-4">
        <ActivityFeed clienteId={cliente.id} />
      </TabsContent>
    </Tabs>
  );
}
