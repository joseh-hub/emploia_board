import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExpandableText } from "@/components/ui/expandable-text";
import { Projeto } from "@/hooks/useProjetos";
import { ProjetoDescriptionEditor } from "./detail/ProjetoDescriptionEditor";
import { ProjetoCommentsSection } from "./detail/ProjetoCommentsSection";
import { ProjetoTarefasTab } from "./detail/ProjetoTarefasTab";
import { semanticBadge } from "@/components/shared/BadgeStyles";
import {
  Building2,
  DollarSign, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  XCircle,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjetoDetailModalProps {
  projeto: Projeto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_LABELS: Record<string, string> = {
  voo_solo: "Voo Solo",
  ativo: "Ativo",
  concluido: "Concluído",
  pausado: "Pausado",
};

const getStatusColor = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case "voo_solo": return "success";
    case "ativo": return "primary";
    case "pausado": return "warning";
    case "concluido": return "muted";
    default: return "muted";
  }
};

function InfoItem({ 
  icon: Icon, 
  label, 
  value,
  isLink = false 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | null | undefined;
  isLink?: boolean;
}) {
  if (!value) return null;
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      {isLink ? (
        <a 
          href={value.startsWith("http") ? value : `https://${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-[#CBC5EA] hover:text-[#ddd8f3] hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm font-medium text-zinc-200 break-words">{value}</span>
      )}
    </div>
  );
}

function formatCurrency(value: number | null) {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR");
}

export function ProjetoDetailModal({
  projeto,
  open,
  onOpenChange,
}: ProjetoDetailModalProps) {
  if (!projeto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] h-[85vh] p-0 flex flex-col overflow-hidden gap-0 bg-zinc-950 border border-zinc-800/60 text-zinc-100">
        <DialogTitle className="sr-only">
          Detalhes do Projeto - {projeto.company_name || "Projeto"}
        </DialogTitle>
        
        {/* Header - Premium Zinc */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-zinc-800/50 flex-shrink-0 bg-zinc-900/40">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-['Krona_One'] text-zinc-100 mb-2 truncate">
              {projeto.company_name || projeto.project_name || "Projeto sem nome"}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn("px-2.5 h-6 text-xs", semanticBadge[getStatusColor(projeto.status)])}
              >
                {STATUS_LABELS[projeto.status || ""] || projeto.status || "Sem status"}
              </Badge>
              {projeto.client_type && (
                <Badge variant="outline" className="h-6 px-2.5 text-xs border-zinc-700 bg-zinc-900/50 text-zinc-400">
                  {projeto.client_type}
                </Badge>
              )}
              {projeto.business_type && (
                <Badge variant="outline" className="h-6 px-2.5 text-xs border-zinc-700 bg-zinc-900/50 text-zinc-400">
                  {projeto.business_type}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-zinc-800/50 px-6 flex-shrink-0 bg-zinc-900/40">
              <TabsList className="h-12 bg-transparent p-0 gap-6">
                <TabsTrigger
                  value="details"
                  className="rounded-none px-1 h-full text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3F1757] data-[state=active]:text-zinc-100 font-medium"
                >
                  Detalhes
                </TabsTrigger>
                <TabsTrigger
                  value="tarefas"
                  className="rounded-none px-1 h-full text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3F1757] data-[state=active]:text-zinc-100 font-medium"
                >
                  Tarefas
                </TabsTrigger>
                <TabsTrigger
                  value="observations"
                  className="rounded-none px-1 h-full text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3F1757] data-[state=active]:text-zinc-100 font-medium"
                >
                  Observações
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="rounded-none px-1 h-full text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#3F1757] data-[state=active]:text-zinc-100 font-medium"
                >
                  Comentários
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 bg-zinc-950">
              <div className="p-6 md:p-8">
                <TabsContent value="details" className="mt-0 space-y-12 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none">
                  
                  {/* Row 1: Informações Gerais + Valores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-5">
                        Informações Gerais
                      </h3>
                      <div className="grid gap-5">
                        <InfoItem icon={Building2} label="Empresa" value={projeto.company_name} />
                        <InfoItem icon={FileText} label="CNPJ" value={projeto.cnpj} />
                        <InfoItem icon={Globe} label="Site" value={projeto.site} isLink />
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-5">
                        Valores & Pagamento
                      </h3>
                      <div className="grid grid-cols-2 gap-5">
                        <InfoItem icon={DollarSign} label="Mensal" value={formatCurrency(projeto.monthly_value)} />
                        <InfoItem icon={DollarSign} label="Implantação" value={formatCurrency(projeto.implementation_value)} />
                        <div className="flex flex-col gap-1 col-span-2">
                          <span className="text-xs text-zinc-500">Status do Sinal</span>
                          <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-200">
                            {projeto.sinal_pago ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-zinc-500" />
                            )}
                            {projeto.sinal_pago ? "Sinal pago" : "Sinal pendente"}
                          </div>
                        </div>
                        {projeto.monthly_date && (
                          <div className="col-span-2">
                            <InfoItem icon={Calendar} label="Dia de Pagamento" value={`Todo dia ${projeto.monthly_date}`} />
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  {/* Row 2: Projeto */}
                  <section className="pt-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-5">
                      Controle do Projeto
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
                      <InfoItem icon={Clock} label="Horas Alocadas" value={`${projeto.horas || 0}h dedicadas`} />
                      <InfoItem icon={Calendar} label="Entrega V1" value={formatDate(projeto.v1_delivery_date)} />
                      <InfoItem icon={LinkIcon} label="Link Proposta" value={projeto.proposal_link} isLink />
                    </div>
                    {projeto.project_scope && (
                      <div className="text-sm">
                        <p className="text-xs text-zinc-500 mb-2">Escopo do Projeto</p>
                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-3 text-zinc-300">
                          <ExpandableText text={projeto.project_scope} maxLength={300} />
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Row 3: Contatos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-2">
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-5">
                        Contato Responsável
                      </h3>
                      <div className="grid gap-5">
                        <InfoItem icon={User} label="Nome" value={projeto.responsible_name} />
                        <InfoItem icon={Mail} label="Email" value={projeto.responsible_email} />
                        <InfoItem icon={Phone} label="WhatsApp" value={projeto.responsible_whatsapp} />
                      </div>
                    </section>

                    {(projeto.financial_email || projeto.financial_whatsapp) && (
                      <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-5">
                          Contato Financeiro
                        </h3>
                        <div className="grid gap-5">
                          <InfoItem icon={Mail} label="Email" value={projeto.financial_email} />
                          <InfoItem icon={Phone} label="WhatsApp" value={projeto.financial_whatsapp} />
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Técnicos & Contexto */}
                  {(projeto.responsavelTecnico?.length || projeto.company_context || projeto.negotiation_details) && (
                    <div className="grid grid-cols-1 gap-8 pt-2">
                      {projeto.responsavelTecnico?.length ? (
                        <section>
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
                            Responsáveis Técnicos
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {projeto.responsavelTecnico.map((resp) => (
                              <Badge key={resp} variant="outline" className="border-zinc-700 text-zinc-300 bg-zinc-800/40 px-3 py-1">
                                {resp}
                              </Badge>
                            ))}
                          </div>
                        </section>
                      ) : null}

                      {(projeto.company_context || projeto.negotiation_details) && (
                        <section>
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
                            Contexto do Negócio
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                            {projeto.company_context && (
                              <div className="text-sm flex flex-col">
                                <p className="text-xs text-zinc-500 mb-2">Sobre a Empresa</p>
                                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 text-zinc-300 leading-relaxed flex-1">
                                  <ExpandableText text={projeto.company_context} maxLength={250} />
                                </div>
                              </div>
                            )}
                            {projeto.negotiation_details && (
                              <div className="text-sm flex flex-col">
                                <p className="text-xs text-zinc-500 mb-2">Detalhes da Negociação</p>
                                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 text-zinc-300 leading-relaxed flex-1">
                                  <ExpandableText text={projeto.negotiation_details} maxLength={250} />
                                </div>
                              </div>
                            )}
                          </div>
                        </section>
                      )}
                    </div>
                  )}

                </TabsContent>

                <TabsContent value="tarefas" className="mt-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none">
                  <ProjetoTarefasTab projetoId={projeto.project_id} />
                </TabsContent>

                <TabsContent value="observations" className="mt-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none">
                  <ProjetoDescriptionEditor
                    projetoId={projeto.project_id}
                    initialDescription={projeto.additional_info}
                  />
                </TabsContent>

                <TabsContent value="comments" className="mt-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:outline-none">
                  <ProjetoCommentsSection projetoId={projeto.project_id} />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
