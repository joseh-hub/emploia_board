import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Projeto } from "@/hooks/useProjetos";
import { ProjetoDescriptionEditor } from "./ProjetoDescriptionEditor";
import { ProjetoActivityFeed } from "./ProjetoActivityFeed";
import { ProjetoCommentsSection } from "./ProjetoCommentsSection";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExpandableText } from "@/components/ui/expandable-text";
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
  Globe
} from "lucide-react";

interface ProjetoDetailTabsProps {
  projeto: Projeto;
}

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
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isLink ? (
          <a 
            href={value.startsWith("http") ? value : `https://${value}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="font-medium break-words">{value}</p>
        )}
      </div>
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

export function ProjetoDetailTabs({ projeto }: ProjetoDetailTabsProps) {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="w-full grid grid-cols-4">
        <TabsTrigger value="details">Detalhes</TabsTrigger>
        <TabsTrigger value="observations">Observações</TabsTrigger>
        <TabsTrigger value="comments">Comentários</TabsTrigger>
        <TabsTrigger value="activity">Atividade</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="mt-4 space-y-6">
        {/* Informações Gerais */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Informações Gerais</h3>
          <div className="grid gap-3">
            <InfoItem icon={Building2} label="Empresa" value={projeto.company_name} />
            <InfoItem icon={FileText} label="CNPJ" value={projeto.cnpj} />
            <InfoItem icon={Globe} label="Site" value={projeto.site} isLink />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Tipo:</span>
              <Badge variant="outline">{projeto.client_type || "Não definido"}</Badge>
              {projeto.business_type && (
                <Badge variant="secondary">{projeto.business_type}</Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Valores */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Valores</h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem icon={DollarSign} label="Mensal" value={formatCurrency(projeto.monthly_value)} />
            <InfoItem icon={DollarSign} label="Implantação" value={formatCurrency(projeto.implementation_value)} />
            <div className="flex items-center gap-2 text-sm col-span-2">
              {projeto.sinal_pago ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span>Sinal {projeto.sinal_pago ? "pago" : "pendente"}</span>
            </div>
            {projeto.monthly_date && (
              <InfoItem icon={Calendar} label="Dia de Pagamento" value={`Dia ${projeto.monthly_date}`} />
            )}
          </div>
        </div>

        <Separator />

        {/* Projeto */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Projeto</h3>
          <div className="grid gap-3">
            <InfoItem icon={Clock} label="Horas Alocadas" value={`${projeto.horas || 0}h`} />
            <InfoItem icon={Calendar} label="Entrega V1" value={formatDate(projeto.v1_delivery_date)} />
            <InfoItem icon={LinkIcon} label="Link Proposta" value={projeto.proposal_link} isLink />
            {projeto.project_scope && (
              <div className="text-sm">
                <p className="text-xs text-muted-foreground mb-1">Escopo do Projeto</p>
                <div className="bg-muted/50 p-2 rounded">
                  <ExpandableText text={projeto.project_scope} maxLength={200} />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Contatos */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Contato Responsável</h3>
          <div className="grid gap-3">
            <InfoItem icon={User} label="Nome" value={projeto.responsible_name} />
            <InfoItem icon={Mail} label="Email" value={projeto.responsible_email} />
            <InfoItem icon={Phone} label="WhatsApp" value={projeto.responsible_whatsapp} />
          </div>
        </div>

        {(projeto.financial_email || projeto.financial_whatsapp) && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Contato Financeiro</h3>
              <div className="grid gap-3">
                <InfoItem icon={Mail} label="Email" value={projeto.financial_email} />
                <InfoItem icon={Phone} label="WhatsApp" value={projeto.financial_whatsapp} />
              </div>
            </div>
          </>
        )}

        {/* Responsáveis Técnicos */}
        {projeto.responsavelTecnico?.length ? (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Responsáveis Técnicos</h3>
              <div className="flex flex-wrap gap-2">
                {projeto.responsavelTecnico.map((resp) => (
                  <Badge key={resp} variant="secondary">{resp}</Badge>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {/* Contexto */}
        {(projeto.company_context || projeto.negotiation_details) && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Contexto</h3>
              <div className="space-y-3">
                {projeto.company_context && (
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Sobre a Empresa</p>
                    <div className="bg-muted/50 p-2 rounded">
                      <ExpandableText text={projeto.company_context} maxLength={200} />
                    </div>
                  </div>
                )}
                {projeto.negotiation_details && (
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Detalhes da Negociação</p>
                    <div className="bg-muted/50 p-2 rounded">
                      <ExpandableText text={projeto.negotiation_details} maxLength={200} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="observations" className="mt-4">
        <ProjetoDescriptionEditor
          projetoId={projeto.project_id}
          initialDescription={projeto.additional_info}
        />
      </TabsContent>

      <TabsContent value="comments" className="mt-4">
        <ProjetoCommentsSection projetoId={projeto.project_id} />
      </TabsContent>

      <TabsContent value="activity" className="mt-4">
        <ProjetoActivityFeed projetoId={projeto.project_id} />
      </TabsContent>
    </Tabs>
  );
}
