import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Cliente {
  id: number;
  name: string | null;
  status: string | null;
  Tipo: string | null;
  receita: number | null;
  horas: number;
  responsavelTecnico: string[] | null;
  data_inicio: string | null;
  cnpj: string | null;
  dia_pagamento: number | null;
  canal_aquisicao: string | null;
  hs_resultado: number | null;
  hs_suporte: number | null;
  hs_inadimplencia: number | null;
  column_id: string | null;
  description?: string | null;
  group_id?: string | null;
}

export interface ClienteFilters {
  search?: string;
  status?: string[];
  tipo?: string[];
  responsavel?: string[];
  column_id?: string;
  receitaRange?: string[];
  healthScore?: string[];
}

export interface CreateClienteInput {
  name: string;
  cnpj?: string;
  Tipo?: string;
  receita?: number;
  horas?: number;
  dia_pagamento?: number;
  canal_aquisicao?: string;
  responsavelTecnico?: string[];
  column_id?: string;
  hs_resultado?: number;
  hs_suporte?: number;
  hs_inadimplencia?: number;
}

export interface UpdateClienteInput extends Partial<CreateClienteInput> {
  id: number;
}

export function useClientes(filters?: ClienteFilters) {
  return useQuery({
    queryKey: ["clientes", filters],
    queryFn: async (): Promise<Cliente[]> => {
      let query = supabase
        .from("metadata_clientes")
        .select("*")
        .order("name", { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      let result = (data || []).map(item => ({
        ...item,
        responsavelTecnico: Array.isArray(item.responsavelTecnico) 
          ? item.responsavelTecnico as string[]
          : null
      })) as Cliente[];

      // Apply client-side filters
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(c => 
          c.name?.toLowerCase().includes(searchLower) ||
          c.cnpj?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.status?.length) {
        result = result.filter(c => filters.status!.includes(c.status || ""));
      }

      if (filters?.tipo?.length) {
        result = result.filter(c => filters.tipo!.includes(c.Tipo || ""));
      }

      if (filters?.responsavel?.length) {
        result = result.filter(c => 
          c.responsavelTecnico?.some(r => filters.responsavel!.includes(r))
        );
      }

      if (filters?.column_id) {
        result = result.filter(c => c.column_id === filters.column_id);
      }

      // Apply revenue range filter
      if (filters?.receitaRange?.length) {
        result = result.filter(c => {
          const receita = c.receita || 0;
          return filters.receitaRange!.some(range => {
            if (range === "Até R$ 5.000") return receita <= 5000;
            if (range === "R$ 5.000 - R$ 15.000") return receita > 5000 && receita <= 15000;
            if (range === "R$ 15.000 - R$ 50.000") return receita > 15000 && receita <= 50000;
            if (range === "Acima de R$ 50.000") return receita > 50000;
            return true;
          });
        });
      }

      // Apply health score filter
      if (filters?.healthScore?.length) {
        result = result.filter(c => {
          const avgHealth = ((c.hs_resultado || 0) + (c.hs_suporte || 0) + (c.hs_inadimplencia || 0)) / 3;
          return filters.healthScore!.some(level => {
            if (level === "critical") return avgHealth < 5;
            if (level === "attention") return avgHealth >= 5 && avgHealth <= 7;
            if (level === "healthy") return avgHealth > 7;
            return true;
          });
        });
      }

      return result;
    },
  });
}

export function useCliente(id: number) {
  return useQuery({
    queryKey: ["cliente", id],
    queryFn: async (): Promise<Cliente | null> => {
      const { data, error } = await supabase
        .from("metadata_clientes")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        responsavelTecnico: Array.isArray(data.responsavelTecnico) 
          ? data.responsavelTecnico as string[]
          : null
      } as Cliente;
    },
    enabled: !!id,
  });
}

export function useResponsaveis() {
  return useQuery({
    queryKey: ["responsaveis"],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("metadata_clientes")
        .select("responsavelTecnico");

      if (error) throw error;

      const responsaveis = new Set<string>();
      data?.forEach(item => {
        if (Array.isArray(item.responsavelTecnico)) {
          (item.responsavelTecnico as string[]).forEach(r => responsaveis.add(r));
        }
      });

      return Array.from(responsaveis).sort();
    },
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClienteInput): Promise<Cliente> => {
      // Get the max id to create a new one
      const { data: maxIdData } = await supabase
        .from("metadata_clientes")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      const newId = (maxIdData?.[0]?.id ?? 0) + 1;

      const { data, error } = await supabase
        .from("metadata_clientes")
        .insert({
          id: newId,
          name: input.name,
          cnpj: input.cnpj,
          Tipo: input.Tipo || "Recorrente",
          receita: input.receita,
          horas: input.horas || 0,
          dia_pagamento: input.dia_pagamento,
          canal_aquisicao: input.canal_aquisicao,
          responsavelTecnico: input.responsavelTecnico || [],
          column_id: input.column_id,
          hs_resultado: input.hs_resultado || 5,
          hs_suporte: input.hs_suporte || 5,
          hs_inadimplencia: input.hs_inadimplencia || 5,
          status: "ATIVO",
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        responsavelTecnico: Array.isArray(data.responsavelTecnico) 
          ? data.responsavelTecnico as string[]
          : null
      } as Cliente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast({
        title: "Cliente criado",
        description: "O cliente foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateClienteInput): Promise<Cliente> => {
      const { id, ...updateData } = input;
      
      // Get current data for activity logging
      const { data: currentData } = await supabase
        .from("metadata_clientes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      const { data, error } = await supabase
        .from("metadata_clientes")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Log activities for changed fields
      const { data: { user } } = await supabase.auth.getUser();
      if (user && currentData) {
        const fieldsToTrack = ["name", "status", "Tipo", "receita", "horas", "column_id", "cnpj", "dia_pagamento", "hs_resultado", "hs_suporte", "hs_inadimplencia"];
        
        for (const field of fieldsToTrack) {
          const oldValue = currentData[field as keyof typeof currentData];
          const newValue = updateData[field as keyof typeof updateData];
          
          if (newValue !== undefined && String(oldValue || "") !== String(newValue || "")) {
            const actionType = field === "status" ? "status_changed" : field === "column_id" ? "moved" : "updated";
            
            await supabase.from("cliente_activities").insert({
              cliente_id: id,
              user_id: user.id,
              action_type: actionType,
              field_name: field,
              old_value: oldValue != null ? String(oldValue) : null,
              new_value: newValue != null ? String(newValue) : null,
            });
          }
        }
      }

      return {
        ...data,
        responsavelTecnico: Array.isArray(data.responsavelTecnico) 
          ? data.responsavelTecnico as string[]
          : null
      } as Cliente;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["cliente-activities", data.id] });
      toast({
        title: "Cliente atualizado",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clienteId: number): Promise<void> => {
      const { error } = await supabase
        .from("metadata_clientes")
        .delete()
        .eq("id", clienteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast({
        title: "Cliente excluído",
        description: "O cliente foi removido do sistema.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useMoveCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clienteId, columnId }: { clienteId: number; columnId: string | null }): Promise<void> => {
      const { error } = await supabase
        .from("metadata_clientes")
        .update({ column_id: columnId })
        .eq("id", clienteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao mover cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
