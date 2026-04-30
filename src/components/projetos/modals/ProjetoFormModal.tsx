import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Projeto, useUpdateProjeto } from "@/hooks/useProjetos";
import { useProjetoBoardColumns } from "@/hooks/useProjetoBoardColumns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const projetoSchema = z.object({
  company_name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  cnpj: z.string().optional(),
  site: z.string().optional(),
  status: z.string().optional(),
  client_type: z.string().optional(),
  business_type: z.string().optional(),
  monthly_value: z.coerce.number().min(0).optional(),
  implementation_value: z.coerce.number().min(0).optional(),
  monthly_date: z.coerce.number().min(1).max(31).optional().nullable(),
  sinal_pago: z.boolean().optional(),
  horas: z.coerce.number().min(0).optional(),
  v1_delivery_date: z.string().optional(),
  project_scope: z.string().optional(),
  proposal_link: z.string().optional(),
  responsible_name: z.string().optional(),
  responsible_email: z.string().email().optional().or(z.literal("")),
  responsible_whatsapp: z.string().optional(),
  financial_email: z.string().email().optional().or(z.literal("")),
  financial_whatsapp: z.string().optional(),
  company_context: z.string().optional(),
  negotiation_details: z.string().optional(),
  column_id: z.string().optional(),
});

type ProjetoFormData = z.infer<typeof projetoSchema>;

interface ProjetoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto?: Projeto | null;
  defaultColumnId?: string;
}

const STATUS_OPTIONS = [
  { value: "voo_solo", label: "Voo Solo" },
  { value: "ativo", label: "Ativo" },
  { value: "concluido", label: "Concluído" },
  { value: "pausado", label: "Pausado" },
];

const CLIENT_TYPES = ["Recorrente", "Projeto", "Consultoria", "Implantação"];
const BUSINESS_TYPES = ["B2B", "B2C", "SaaS", "Marketplace", "E-commerce", "Serviços"];

export function ProjetoFormModal({
  open,
  onOpenChange,
  projeto,
  defaultColumnId,
}: ProjetoFormModalProps) {
  const isEditing = !!projeto;
  const { data: columns } = useProjetoBoardColumns();
  const updateProjeto = useUpdateProjeto();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ProjetoFormData>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      company_name: "",
      cnpj: "",
      site: "",
      status: "ativo",
      client_type: "",
      business_type: "",
      monthly_value: 0,
      implementation_value: 0,
      monthly_date: null,
      sinal_pago: false,
      horas: 0,
      v1_delivery_date: "",
      project_scope: "",
      proposal_link: "",
      responsible_name: "",
      responsible_email: "",
      responsible_whatsapp: "",
      financial_email: "",
      financial_whatsapp: "",
      company_context: "",
      negotiation_details: "",
      column_id: defaultColumnId || "",
    },
  });

  useEffect(() => {
    if (projeto) {
      form.reset({
        company_name: projeto.company_name || "",
        cnpj: projeto.cnpj || "",
        site: projeto.site || "",
        status: projeto.status || "ativo",
        client_type: projeto.client_type || "",
        business_type: projeto.business_type || "",
        monthly_value: projeto.monthly_value || 0,
        implementation_value: projeto.implementation_value || 0,
        monthly_date: projeto.monthly_date || null,
        sinal_pago: projeto.sinal_pago || false,
        horas: projeto.horas || 0,
        v1_delivery_date: projeto.v1_delivery_date || "",
        project_scope: projeto.project_scope || "",
        proposal_link: projeto.proposal_link || "",
        responsible_name: projeto.responsible_name || "",
        responsible_email: projeto.responsible_email || "",
        responsible_whatsapp: projeto.responsible_whatsapp || "",
        financial_email: projeto.financial_email || "",
        financial_whatsapp: projeto.financial_whatsapp || "",
        company_context: projeto.company_context || "",
        negotiation_details: projeto.negotiation_details || "",
        column_id: projeto.column_id || "",
      });
    } else {
      form.reset({
        company_name: "",
        cnpj: "",
        site: "",
        status: "ativo",
        client_type: "",
        business_type: "",
        monthly_value: 0,
        implementation_value: 0,
        monthly_date: null,
        sinal_pago: false,
        horas: 0,
        v1_delivery_date: "",
        project_scope: "",
        proposal_link: "",
        responsible_name: "",
        responsible_email: "",
        responsible_whatsapp: "",
        financial_email: "",
        financial_whatsapp: "",
        company_context: "",
        negotiation_details: "",
        column_id: defaultColumnId || "",
      });
    }
  }, [projeto, defaultColumnId, form]);

  const onSubmit = async (data: ProjetoFormData) => {
    setIsPending(true);
    try {
      if (isEditing && projeto) {
        await updateProjeto.mutateAsync({
          id: projeto.project_id,
          data: {
            company_name: data.company_name,
            cnpj: data.cnpj,
            site: data.site,
            status: data.status,
            client_type: data.client_type,
            business_type: data.business_type,
            monthly_value: data.monthly_value,
            implementation_value: data.implementation_value,
            monthly_date: data.monthly_date,
            sinal_pago: data.sinal_pago,
            horas: data.horas,
            v1_delivery_date: data.v1_delivery_date || null,
            project_scope: data.project_scope,
            proposal_link: data.proposal_link,
            responsible_name: data.responsible_name,
            responsible_email: data.responsible_email,
            responsible_whatsapp: data.responsible_whatsapp,
            financial_email: data.financial_email,
            financial_whatsapp: data.financial_whatsapp,
            company_context: data.company_context,
            negotiation_details: data.negotiation_details,
            column_id: data.column_id || null,
          },
          oldData: projeto as unknown as Record<string, unknown>,
        });
      } else {
        // Create new projeto
        const { error } = await supabase.from("projetos").insert({
          company_name: data.company_name,
          cnpj: data.cnpj,
          site: data.site,
          status: data.status || "ativo",
          client_type: data.client_type,
          business_type: data.business_type,
          monthly_value: data.monthly_value,
          implementation_value: data.implementation_value,
          monthly_date: data.monthly_date,
          sinal_pago: data.sinal_pago,
          horas: data.horas,
          v1_delivery_date: data.v1_delivery_date || null,
          project_scope: data.project_scope,
          proposal_link: data.proposal_link,
          responsible_name: data.responsible_name,
          responsible_email: data.responsible_email,
          responsible_whatsapp: data.responsible_whatsapp,
          financial_email: data.financial_email,
          financial_whatsapp: data.financial_whatsapp,
          company_context: data.company_context,
          negotiation_details: data.negotiation_details,
          column_id: data.column_id || null,
        });

        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ["projetos"] });
        toast({
          title: "Projeto criado",
          description: "O projeto foi adicionado com sucesso.",
        });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Krona_One']">
            {isEditing ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="valores">Valores</TabsTrigger>
                <TabsTrigger value="contatos">Contatos</TabsTrigger>
                <TabsTrigger value="contexto">Contexto</TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do projeto/empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="site"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site</FormLabel>
                        <FormControl>
                          <Input placeholder="www.empresa.com.br" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Cliente</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CLIENT_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="business_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Negócio</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BUSINESS_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="horas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas Alocadas</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="v1_delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Entrega V1</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="column_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coluna do Board</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma coluna" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {columns?.map((col) => (
                            <SelectItem key={col.id} value={col.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: col.color }}
                                />
                                {col.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="valores" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthly_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Mensal (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="implementation_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Implantação (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="monthly_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia de Pagamento</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="1-31"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sinal_pago"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0 pt-6">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Sinal Pago</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="proposal_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link da Proposta</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="contatos" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Contato Responsável</h4>
                  
                  <FormField
                    control={form.control}
                    name="responsible_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do responsável" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="responsible_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@empresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="responsible_whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Contato Financeiro</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="financial_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="financeiro@empresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="financial_whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contexto" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="project_scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escopo do Projeto</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o escopo do projeto..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contexto da Empresa</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações sobre a empresa..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="negotiation_details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detalhes da Negociação</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detalhes sobre a negociação..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-[#ED6A5A] hover:bg-[#e05a4a] text-white border-0">
                {isPending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
