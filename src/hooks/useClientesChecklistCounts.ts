import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClienteChecklistCount {
  total: number;
  completed: number;
}

/**
 * Returns a map { [clienteId]: { total, completed } } for all clients in one query.
 * Used by the board cards to show progress without querying per card.
 */
export function useClientesChecklistCounts() {
  return useQuery({
    queryKey: ["clientes-checklist-counts"],
    queryFn: async (): Promise<Record<number, ClienteChecklistCount>> => {
      const { data, error } = await supabase
        .from("cliente_checklist_items")
        .select("cliente_id, concluido");
      if (error) throw error;
      const map: Record<number, ClienteChecklistCount> = {};
      for (const row of data || []) {
        const id = row.cliente_id as number;
        if (!map[id]) map[id] = { total: 0, completed: 0 };
        map[id].total += 1;
        if (row.concluido) map[id].completed += 1;
      }
      return map;
    },
  });
}
