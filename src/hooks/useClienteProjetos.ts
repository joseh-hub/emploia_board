import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Projeto } from "./useProjetos";

export function useClienteProjetos(clienteId: number) {
  return useQuery({
    queryKey: ["cliente-projetos", clienteId],
    queryFn: async (): Promise<Projeto[]> => {
      const { data, error } = await supabase
        .from("projetos")
        .select("*")
        .eq("id_cliente", clienteId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        responsavelTecnico: Array.isArray(item.responsavelTecnico) 
          ? item.responsavelTecnico as string[]
          : null,
        responsavel_horas: typeof item.responsavel_horas === 'object' 
          ? item.responsavel_horas as Record<string, number>
          : null,
        stage_due_date: null,
        stage_name: null,
      })) as Projeto[];
    },
    enabled: !!clienteId,
  });
}
