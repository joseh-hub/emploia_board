import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OverviewRow {
  clienteName: string;
  projetoName: string;
  projetoId: string;
  checklistName: string;
  dueDate: string | null;
  status: "a_fazer" | "fazendo" | "feito";
  tarefaId: string;
}

export function useProjetosOverview() {
  return useQuery({
    queryKey: ["projetos-overview"],
    queryFn: async (): Promise<OverviewRow[]> => {
      // Projects to exclude from overview (manual list)
      const excludedProjetoIds = new Set([
        'fb1b8d12-a1d4-4067-a582-cd59cb7087af', // ARMS - POC
        '4b673a09-200a-4afc-ad0e-89956610de3c', // ARMS - INTERNO
        '4247bd04-e08d-44c8-8f41-0b383e22ef2d', // Bulbe
        '0074c223-dcf9-4db3-973b-98ca6e6493e3', // Endogastro
        '762b88c8-e26e-461e-845c-04c3b4f7ca92', // GV Energia
        'dd1fef8e-6a20-42cc-b679-102959afd67a', // NuvemShop
        'b45bd8b2-90c0-4660-a926-a81a5a94b74f', // Phone Dreams
        'f3e6ddec-6a77-4eca-b8d7-49c77619ad88', // Ponto do Iphone
        'a16a0283-c679-4803-9b2f-86941329727c', // Auto Truck
      ]);

      // Also exclude projects in the Churn column
      const CHURN_COLUMN_ID = '0a0a7b95-c791-4de5-b8c9-77ff3dc8adc0';
      const { data: churnProjetos } = await supabase
        .from("projetos")
        .select("project_id")
        .eq("column_id", CHURN_COLUMN_ID);
      for (const p of churnProjetos || []) {
        excludedProjetoIds.add(p.project_id);
      }

      // 1. Fetch all tarefas that came from default templates
      const { data: tarefas, error: tarefasError } = await supabase
        .from("projeto_tarefas")
        .select("id, projeto_id, titulo, due_date, priorizado, template_id, status")
        .not("template_id", "is", null);

      if (tarefasError) throw tarefasError;
      if (!tarefas || tarefas.length === 0) return [];

      // Filter out excluded projects
      const filteredTarefas = tarefas.filter(t => !excludedProjetoIds.has(t.projeto_id));

      const templateIds = [...new Set(filteredTarefas.map((t) => t.template_id).filter(Boolean))] as string[];

      const { data: templates } = await supabase
        .from("task_templates")
        .select("id, is_default")
        .in("id", templateIds)
        .eq("is_default", true);

      const defaultTemplateIds = new Set((templates || []).map((t) => t.id));
      const defaultTarefas = filteredTarefas.filter((t) => t.template_id && defaultTemplateIds.has(t.template_id));

      if (defaultTarefas.length === 0) return [];

      // 3. Get checklists for these tarefas
      const tarefaIds = defaultTarefas.map((t) => t.id);
      const { data: checklists } = await supabase
        .from("tarefa_checklists")
        .select("tarefa_id, concluido")
        .in("tarefa_id", tarefaIds);

      const checklistMap = new Map<string, { total: number; completed: number }>();
      for (const cl of checklists || []) {
        const entry = checklistMap.get(cl.tarefa_id) || { total: 0, completed: 0 };
        entry.total++;
        if (cl.concluido) entry.completed++;
        checklistMap.set(cl.tarefa_id, entry);
      }

      // 4. Get unique projeto IDs and fetch projetos + clientes
      const projetoIds = [...new Set(defaultTarefas.map((t) => t.projeto_id))];
      const { data: projetos } = await supabase
        .from("projetos")
        .select("project_id, company_name, project_name, id_cliente")
        .in("project_id", projetoIds);

      const clienteIds = [...new Set((projetos || []).map((p) => p.id_cliente).filter(Boolean))] as number[];
      let clienteMap = new Map<number, string>();
      if (clienteIds.length > 0) {
        const { data: clientes } = await supabase
          .from("metadata_clientes")
          .select("id, name")
          .in("id", clienteIds);
        for (const c of clientes || []) {
          clienteMap.set(c.id, c.name || "Sem nome");
        }
      }

      const projetoMap = new Map<string, { name: string; clienteName: string }>();
      for (const p of projetos || []) {
        projetoMap.set(p.project_id, {
          name: p.project_name || p.company_name || "Sem nome",
          clienteName: p.id_cliente ? clienteMap.get(p.id_cliente) || "Sem cliente" : "Sem cliente",
        });
      }

      // 5. Build rows
      const rows: OverviewRow[] = defaultTarefas.map((t) => {
        const projeto = projetoMap.get(t.projeto_id);
        const cl = checklistMap.get(t.id);

        let status: OverviewRow["status"] = "a_fazer";
        if (t.status === "concluido" || (cl && cl.total > 0 && cl.completed === cl.total)) {
          status = "feito";
        } else if (t.priorizado) {
          status = "fazendo";
        }

        return {
          clienteName: projeto?.clienteName || "Sem cliente",
          projetoName: projeto?.name || "Sem nome",
          projetoId: t.projeto_id,
          checklistName: t.titulo,
          dueDate: t.due_date,
          status,
          tarefaId: t.id,
        };
      });

      // Sort by cliente, projeto, due_date
      rows.sort((a, b) => {
        const cmp1 = a.clienteName.localeCompare(b.clienteName);
        if (cmp1 !== 0) return cmp1;
        const cmp2 = a.projetoName.localeCompare(b.projetoName);
        if (cmp2 !== 0) return cmp2;
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      return rows;
    },
  });
}
