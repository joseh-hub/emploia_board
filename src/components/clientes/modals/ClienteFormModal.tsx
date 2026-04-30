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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cliente, useCreateCliente, useUpdateCliente } from "@/hooks/useClientes";
import { useBoardColumns } from "@/hooks/useBoardColumns";
import { useApplyDefaultChecklistToCliente } from "@/hooks/useClienteChecklist";
import { Switch } from "@/components/ui/switch";
import { ListChecks } from "lucide-react";

const clienteSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  cnpj: z.string().optional(),
  Tipo: z.string().optional(),
  receita: z.coerce.number().min(0).optional(),
  horas: z.coerce.number().min(0).optional(),
  dia_pagamento: z.coerce.number().min(1).max(31).optional().nullable(),
  canal_aquisicao: z.string().optional(),
  column_id: z.string().optional(),
  hs_resultado: z.coerce.number().min(0).max(10).optional(),
  hs_suporte: z.coerce.number().min(0).max(10).optional(),
  hs_inadimplencia: z.coerce.number().min(0).max(10).optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  defaultColumnId?: string;
}

const TIPOS_CLIENTE = ["Recorrente", "Projeto", "Consultoria"];
const CANAIS_AQUISICAO = ["Indicação", "Google", "LinkedIn", "Evento", "Outbound", "Inbound"];

export function ClienteFormModal({
  open,
  onOpenChange,
  cliente,
  defaultColumnId,
}: ClienteFormModalProps) {
  const isEditing = !!cliente;
  const { data: columns } = useBoardColumns();
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  const applyDefaultChecklist = useApplyDefaultChecklistToCliente();
  const [applyChecklist, setApplyChecklist] = useState(true);

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      Tipo: "Recorrente",
      receita: 0,
      horas: 0,
      dia_pagamento: null,
      canal_aquisicao: "",
      column_id: defaultColumnId || "",
      hs_resultado: 5,
      hs_suporte: 5,
      hs_inadimplencia: 5,
    },
  });

  useEffect(() => {
    if (cliente) {
      form.reset({
        name: cliente.name || "",
        cnpj: cliente.cnpj || "",
        Tipo: cliente.Tipo?.replace("\r\n", "") || "Recorrente",
        receita: cliente.receita || 0,
        horas: cliente.horas || 0,
        dia_pagamento: cliente.dia_pagamento || null,
        canal_aquisicao: cliente.canal_aquisicao || "",
        column_id: cliente.column_id || "",
        hs_resultado: cliente.hs_resultado || 5,
        hs_suporte: cliente.hs_suporte || 5,
        hs_inadimplencia: cliente.hs_inadimplencia || 5,
      });
    } else {
      form.reset({
        name: "",
        cnpj: "",
        Tipo: "Recorrente",
        receita: 0,
        horas: 0,
        dia_pagamento: null,
        canal_aquisicao: "",
        column_id: defaultColumnId || "",
        hs_resultado: 5,
        hs_suporte: 5,
        hs_inadimplencia: 5,
      });
    }
  }, [cliente, defaultColumnId, form]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      if (isEditing && cliente) {
        await updateCliente.mutateAsync({
          id: cliente.id,
          name: data.name,
          cnpj: data.cnpj,
          Tipo: data.Tipo,
          receita: data.receita,
          horas: data.horas,
          dia_pagamento: data.dia_pagamento || undefined,
          canal_aquisicao: data.canal_aquisicao,
          column_id: data.column_id,
          hs_resultado: data.hs_resultado,
          hs_suporte: data.hs_suporte,
          hs_inadimplencia: data.hs_inadimplencia,
        });
      } else {
        await createCliente.mutateAsync({
          name: data.name,
          cnpj: data.cnpj,
          Tipo: data.Tipo,
          receita: data.receita,
          horas: data.horas,
          dia_pagamento: data.dia_pagamento || undefined,
          canal_aquisicao: data.canal_aquisicao,
          column_id: data.column_id,
          hs_resultado: data.hs_resultado,
          hs_suporte: data.hs_suporte,
          hs_inadimplencia: data.hs_inadimplencia,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutations
    }
  };

  const isPending = createCliente.isPending || updateCliente.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Krona_One']">
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
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
                name="Tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_CLIENTE.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
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
                name="receita"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receita Mensal (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dia_pagamento"
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
                name="canal_aquisicao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canal de Aquisição</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CANAIS_AQUISICAO.map((canal) => (
                          <SelectItem key={canal} value={canal}>
                            {canal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Health Scores (0-10)</h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="hs_resultado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Resultado</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hs_suporte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Suporte</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hs_inadimplencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Inadimplência</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
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
