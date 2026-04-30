import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cliente } from "@/hooks/useClientes";
import { supabase } from "@/integrations/supabase/client";
import { 
  X, 
  Building, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users,
  FileText,
  MessageSquare,
  FolderKanban
} from "lucide-react";
import { DescriptionEditor } from "./detail/DescriptionEditor";
import { CommentsSection } from "./detail/CommentsSection";
import { ClienteProjetosTab } from "./detail/ClienteProjetosTab";

interface ClienteDetailModalProps {
  cliente: Cliente | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClienteWithDescription extends Cliente {
  description?: string | null;
}

export function ClienteDetailModal({
  cliente,
  open,
  onOpenChange,
}: ClienteDetailModalProps) {
  const [fullCliente, setFullCliente] = useState<ClienteWithDescription | null>(null);

  useEffect(() => {
    if (cliente && open) {
      supabase
        .from("metadata_clientes")
        .select("*")
        .eq("id", cliente.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setFullCliente({
              ...cliente,
              description: data.description,
            });
          } else {
            setFullCliente(cliente);
          }
        });
    } else {
      setFullCliente(null);
    }
  }, [cliente, open]);

  if (!cliente) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full h-[85vh] p-0 flex flex-col bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
              {cliente.name?.slice(0, 2).toUpperCase() || "??"}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{cliente.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={cliente.status === "ATIVO" ? "default" : "secondary"}>
                  {cliente.status || "Sem status"}
                </Badge>
                <Badge variant="outline">{cliente.Tipo?.replace("\r\n", "") || "Sem tipo"}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="details" className="h-full flex flex-col">
              <div className="px-6 pt-3 border-b border-white/5 bg-zinc-950/50">
                <TabsList className="h-10 bg-transparent gap-4">
                  <TabsTrigger value="details" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Detalhes
                  </TabsTrigger>
                  <TabsTrigger value="projetos" className="gap-2">
                    <FolderKanban className="h-4 w-4" />
                    Projetos
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comentários
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6">
                  <TabsContent value="details" className="mt-0 space-y-6">
                    {/* Properties Grid - ClickUp Style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PropertyRow 
                        icon={<DollarSign className="h-4 w-4" />} 
                        label="Receita Mensal" 
                        value={formatCurrency(cliente.receita)} 
                      />
                      <PropertyRow 
                        icon={<Clock className="h-4 w-4" />} 
                        label="Horas Alocadas" 
                        value={`${cliente.horas}h`} 
                      />
                      <PropertyRow 
                        icon={<Calendar className="h-4 w-4" />} 
                        label="Data de Início" 
                        value={formatDate(cliente.data_inicio)} 
                      />
                      {cliente.dia_pagamento && (
                        <PropertyRow 
                          icon={<DollarSign className="h-4 w-4" />} 
                          label="Dia de Pagamento" 
                          value={`Dia ${cliente.dia_pagamento}`} 
                        />
                      )}
                      {cliente.cnpj && (
                        <PropertyRow 
                          icon={<Building className="h-4 w-4" />} 
                          label="CNPJ" 
                          value={cliente.cnpj} 
                        />
                      )}
                      {cliente.responsavelTecnico?.length ? (
                        <div className="flex items-center gap-4 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">Responsáveis</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {cliente.responsavelTecnico.map((resp) => (
                              <Badge key={resp} variant="secondary" className="text-xs">
                                {resp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Content specific rows without heavy separators */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-zinc-900/20">
                      <h4 className="text-sm font-medium text-zinc-400">Health Scores</h4>
                      <div className="flex gap-3">
                        <HealthScoreCard 
                          label="Resultado" 
                          value={cliente.hs_resultado || 0} 
                        />
                        <HealthScoreCard 
                          label="Suporte" 
                          value={cliente.hs_suporte || 0} 
                        />
                        <HealthScoreCard 
                          label="Inadimplência" 
                          value={cliente.hs_inadimplencia || 0} 
                        />
                      </div>
                    </div>

                    {/* Description Editor */}
                    {fullCliente && (
                      <DescriptionEditor 
                        clienteId={cliente.id} 
                        initialDescription={fullCliente.description || null}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="projetos" className="mt-0">
                    <ClienteProjetosTab clienteId={cliente.id} />
                  </TabsContent>

                  <TabsContent value="comments" className="mt-0">
                    <CommentsSection clienteId={cliente.id} />
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PropertyRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function HealthScoreCard({ label, value }: { label: string; value: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-success bg-success/10 border-success/20";
    if (score >= 5) return "text-warning bg-warning/10 border-warning/20";
    return "text-destructive bg-destructive/10 border-destructive/20";
  };

  return (
    <div className={`flex flex-col items-center justify-center py-2 px-3 min-w-[100px] rounded-lg border ${getScoreColor(value)}`}>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80 mt-0.5">{label}</span>
    </div>
  );
}
