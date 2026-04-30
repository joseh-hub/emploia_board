import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClienteChecklistCount {
  total: number;
  completed: number;
  overdue: number;
}

/**
 * Returns a map { [clienteId]: { total, completed, overdue } } for all clients in one query.
 */
export function useClientesChecklistCounts() {
  return useQuery({
    queryKey: ["clientes-checklist-counts"],
    queryFn: async (): Promise<Record<number, ClienteChecklistCount>> => {
      const { data, error } = await supabase
        .from("cliente_checklist_items")
        .select("cliente_id, concluido, due_date");
      if (error) throw error;
      const todayIso = new Date().toISOString().slice(0, 10);
      const map: Record<number, ClienteChecklistCount> = {};
      for (const row of data || []) {
        const id = row.cliente_id as number;
        if (!map[id]) map[id] = { total: 0, completed: 0, overdue: 0 };
        map[id].total += 1;
        if (row.concluido) {
          map[id].completed += 1;
        } else if (row.due_date && (row.due_date as string) < todayIso) {
          map[id].overdue += 1;
        }
      }
      return map;
    },
  });
}
