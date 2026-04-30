import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Projects to exclude (manual list)
    const excludedProjetoIds = new Set([
      "fb1b8d12-a1d4-4067-a582-cd59cb7087af",
      "4b673a09-200a-4afc-ad0e-89956610de3c",
      "4247bd04-e08d-44c8-8f41-0b383e22ef2d",
      "0074c223-dcf9-4db3-973b-98ca6e6493e3",
      "762b88c8-e26e-461e-845c-04c3b4f7ca92",
      "dd1fef8e-6a20-42cc-b679-102959afd67a",
      "b45bd8b2-90c0-4660-a926-a81a5a94b74f",
      "f3e6ddec-6a77-4eca-b8d7-49c77619ad88",
      "a16a0283-c679-4803-9b2f-86941329727c",
    ]);

    // Exclude projects in Churn column
    const CHURN_COLUMN_ID = "0a0a7b95-c791-4de5-b8c9-77ff3dc8adc0";
    const { data: churnProjetos } = await supabase
      .from("projetos")
      .select("project_id")
      .eq("column_id", CHURN_COLUMN_ID);
    for (const p of churnProjetos || []) {
      excludedProjetoIds.add(p.project_id);
    }

    // 1. Fetch tarefas with template_id
    const { data: tarefas, error: tarefasError } = await supabase
      .from("projeto_tarefas")
      .select("id, projeto_id, titulo, due_date, priorizado, template_id, status")
      .not("template_id", "is", null);

    if (tarefasError) throw tarefasError;
    if (!tarefas || tarefas.length === 0) {
      // Clear table if no tarefas
      await supabase.from("projetos_overview").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      return new Response(JSON.stringify({ refreshed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const filteredTarefas = tarefas.filter(
      (t: any) => !excludedProjetoIds.has(t.projeto_id)
    );

    // 2. Filter by default templates
    const templateIds = [
      ...new Set(filteredTarefas.map((t: any) => t.template_id).filter(Boolean)),
    ] as string[];

    const { data: templates } = await supabase
      .from("task_templates")
      .select("id, is_default")
      .in("id", templateIds)
      .eq("is_default", true);

    const defaultTemplateIds = new Set((templates || []).map((t: any) => t.id));
    const defaultTarefas = filteredTarefas.filter(
      (t: any) => t.template_id && defaultTemplateIds.has(t.template_id)
    );

    if (defaultTarefas.length === 0) {
      await supabase.from("projetos_overview").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      return new Response(JSON.stringify({ refreshed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Get checklists
    const tarefaIds = defaultTarefas.map((t: any) => t.id);
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

    // 4. Get projetos + clientes + board columns
    const projetoIds = [...new Set(defaultTarefas.map((t: any) => t.projeto_id))];
    const { data: projetos } = await supabase
      .from("projetos")
      .select("project_id, company_name, project_name, id_cliente, column_id")
      .in("project_id", projetoIds);

    // Fetch board columns for stage names
    const { data: boardColumns } = await supabase
      .from("projeto_board_columns")
      .select("id, name");

    const columnMap = new Map<string, string>();
    for (const col of boardColumns || []) {
      columnMap.set(col.id, col.name);
    }

    const clienteIds = [
      ...new Set((projetos || []).map((p: any) => p.id_cliente).filter(Boolean)),
    ] as number[];

    const clienteMap = new Map<number, string>();
    if (clienteIds.length > 0) {
      const { data: clientes } = await supabase
        .from("metadata_clientes")
        .select("id, name")
        .in("id", clienteIds);
      for (const c of clientes || []) {
        clienteMap.set(c.id, c.name || "Sem nome");
      }
    }

    const projetoMap = new Map<string, { name: string; clienteName: string; boardStage: string | null }>();
    for (const p of projetos || []) {
      projetoMap.set(p.project_id, {
        name: p.project_name || p.company_name || "Sem nome",
        clienteName: p.id_cliente
          ? clienteMap.get(p.id_cliente) || "Sem cliente"
          : "Sem cliente",
        boardStage: p.column_id ? columnMap.get(p.column_id) || null : null,
      });
    }

    // 5. Build rows
    const rows = defaultTarefas.map((t: any) => {
      const projeto = projetoMap.get(t.projeto_id);
      const cl = checklistMap.get(t.id);

      let status = "a_fazer";
      if (t.status === "concluido" || (cl && cl.total > 0 && cl.completed === cl.total)) {
        status = "feito";
      } else if (t.priorizado) {
        status = "fazendo";
      }

      return {
        tarefa_id: t.id,
        projeto_id: t.projeto_id,
        cliente_name: projeto?.clienteName || "Sem cliente",
        projeto_name: projeto?.name || "Sem nome",
        checklist_name: t.titulo,
        due_date: t.due_date,
        status,
        board_stage: projeto?.boardStage || null,
        updated_at: new Date().toISOString(),
      };
    });

    // 6. Upsert rows
    const { error: upsertError } = await supabase
      .from("projetos_overview")
      .upsert(rows, { onConflict: "tarefa_id" });

    if (upsertError) throw upsertError;

    // 7. Remove orphan rows
    const validTarefaIds = rows.map((r: any) => r.tarefa_id);
    const { error: deleteError } = await supabase
      .from("projetos_overview")
      .delete()
      .not("tarefa_id", "in", `(${validTarefaIds.join(",")})`);

    if (deleteError) throw deleteError;

    return new Response(
      JSON.stringify({ refreshed: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
