import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Variáveis disponíveis para interpolação nas perguntas
const AVAILABLE_VARIABLES = [
  "{card.nome}",
  "{card.status}",
  "{card.coluna}",
  "{card.dataEntrega}",
  "{card.dataInicio}",
  "{card.prioridade}",
  "{card.projeto}",
  "{card.checklist.pendentes}",
  "{card.checklist.total}",
  "{usuario.nome}",
];

// Nomes dos dias da semana em português
const DIAS_SEMANA = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

function interpolateQuestion(
  text: string,
  card: Record<string, unknown>,
  usuario: { nome: string }
): string {
  return text
    .replace(/\{card\.nome\}/g, String(card.titulo ?? ""))
    .replace(/\{card\.status\}/g, String(card.status ?? ""))
    .replace(/\{card\.coluna\}/g, String(card.coluna ?? ""))
    .replace(/\{card\.dataEntrega\}/g, String(card.dataEntrega ?? "sem prazo"))
    .replace(/\{card\.dataInicio\}/g, String(card.dataInicio ?? "sem início"))
    .replace(/\{card\.prioridade\}/g, String(card.priority ?? "normal"))
    .replace(/\{card\.projeto\}/g, String(card.projeto ?? ""))
    .replace(/\{card\.checklist\.pendentes\}/g, String(card.checklistPendentes ?? 0))
    .replace(/\{card\.checklist\.total\}/g, String(card.checklistTotal ?? 0))
    .replace(/\{usuario\.nome\}/g, usuario.nome);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const n8nWebhookUrlDefault =
      Deno.env.get("N8N_WEBHOOK_URL") ??
      "https://n8n.agenciaarms.com/webhook-test/receber-mensagem";

    // Aceita override de webhook e flag de teste via body
    let webhookUrlOverride: string | null = null;
    let forceAll = false;
    try {
      const body = await req.json();
      if (body?.webhook_url_override) webhookUrlOverride = body.webhook_url_override;
      if (body?.force_all) forceAll = true;
    } catch { /* body vazio é ok */ }

    const n8nWebhookUrl = webhookUrlOverride ?? n8nWebhookUrlDefault;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Hora atual no Brasil (UTC-3)
    const nowUtc = new Date();
    const nowBrasil = new Date(nowUtc.getTime() - 3 * 60 * 60 * 1000);
    const diaSemana = nowBrasil.getDay(); // 0=dom, 6=sab

    // Verificar se é dia útil (segunda=1 a sexta=5) — ignorado se for teste com override
    if (!webhookUrlOverride && !forceAll && (diaSemana === 0 || diaSemana === 6)) {
      return new Response(
        JSON.stringify({ message: "Fim de semana, nenhum check-in enviado." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Horário atual no Brasil no formato HH:MM
    const horaAtual = `${String(nowBrasil.getUTCHours()).padStart(2, "0")}:${String(
      nowBrasil.getUTCMinutes()
    ).padStart(2, "0")}`;

    // Buscar configs de usuários ativos
    const { data: userConfigs, error: configsError } = await supabase
      .from("daily_checkin_user_config")
      .select("*")
      .eq("is_active", true);

    if (configsError) throw configsError;
    if (!userConfigs || userConfigs.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum usuário configurado." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Se for teste (webhook override), envia para todos os usuários ativos ignorando horário
    const usuariosParaEnviar = (webhookUrlOverride || forceAll)
      ? userConfigs
      : userConfigs.filter((cfg) => {
          const scheduleHHMM = cfg.schedule_time.substring(0, 5);
          return scheduleHHMM === horaAtual;
        });

    if (usuariosParaEnviar.length === 0) {
      return new Response(
        JSON.stringify({ message: `Nenhum usuário agendado para ${horaAtual}.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar config global (perguntas)
    const { data: globalConfig } = await supabase
      .from("daily_checkin_config")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    const questions: Array<{ id: string; text: string }> =
      (globalConfig?.questions as Array<{ id: string; text: string }>) ?? [];

    // Buscar colunas de tarefas para mapear ID → nome
    const { data: tarefaColunas } = await supabase
      .from("tarefa_board_columns")
      .select("id, name");

    const tarefaColunaMap: Record<string, string> = {};
    for (const col of tarefaColunas ?? []) {
      tarefaColunaMap[col.id] = col.name;
    }

    // Buscar colunas de projetos para mapear ID → nome
    const { data: projetoColunas } = await supabase
      .from("projeto_board_columns")
      .select("id, name");

    const projetoColunaMap: Record<string, string> = {};
    for (const col of projetoColunas ?? []) {
      projetoColunaMap[col.id] = col.name;
    }

    const results: Array<{ userId: string; status: string; error?: string }> = [];

    for (const cfg of usuariosParaEnviar) {
      try {
        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, email, whatsapp_phone")
          .eq("id", cfg.user_id)
          .maybeSingle();

        if (!profile) {
          results.push({ userId: cfg.user_id, status: "skipped", error: "Perfil não encontrado" });
          continue;
        }

        if (!profile.whatsapp_phone) {
          results.push({ userId: cfg.user_id, status: "skipped", error: "Sem número WhatsApp cadastrado" });
          continue;
        }

        // Buscar projetos atribuídos ao usuário
        const { data: projetos, error: projetosError } = await supabase
          .from("projetos")
          .select("project_id, company_name, status, column_id, id_cliente")
          .contains("responsible_email", [profile.email ?? ""])
          .neq("status", "concluido");

        // Alternativa: buscar por tarefas assigned_users contendo este userId
        // Buscar tarefas do usuário nas colunas selecionadas
        const selectedColumnsTarefas = cfg.selected_columns_tarefas as string[];

        let tarefasQuery = supabase
          .from("projeto_tarefas")
          .select("id, projeto_id, titulo, descricao, status, priority, column_id, start_date, due_date, assigned_users, priorizado");

        if (selectedColumnsTarefas && selectedColumnsTarefas.length > 0) {
          tarefasQuery = tarefasQuery.in("column_id", selectedColumnsTarefas);
        }

        const { data: todasTarefas } = await tarefasQuery;

        // Filtrar tarefas onde o usuário está atribuído
        const tarefasDoUsuario = (todasTarefas ?? []).filter((t) => {
          const assignedUsers = t.assigned_users as string[] ?? [];
          return assignedUsers.includes(cfg.user_id);
        });

        if (tarefasDoUsuario.length === 0) {
          results.push({ userId: cfg.user_id, status: "skipped", error: "Sem tarefas nas colunas selecionadas" });
          continue;
        }

        // Buscar checklists das tarefas
        const tarefaIds = tarefasDoUsuario.map((t) => t.id);
        const { data: checklists } = await supabase
          .from("tarefa_checklists")
          .select("id, tarefa_id, texto, concluido, position")
          .in("tarefa_id", tarefaIds)
          .order("position", { ascending: true });

        const checklistByTarefaId: Record<string, Array<{ texto: string; concluido: boolean }>> = {};
        for (const item of checklists ?? []) {
          if (!checklistByTarefaId[item.tarefa_id]) {
            checklistByTarefaId[item.tarefa_id] = [];
          }
          checklistByTarefaId[item.tarefa_id].push({
            texto: item.texto,
            concluido: item.concluido,
          });
        }

        // Agrupar tarefas por projeto
        const projetoIds = [...new Set(tarefasDoUsuario.map((t) => t.projeto_id))];
        const { data: projetosData } = await supabase
          .from("projetos")
          .select("project_id, company_name, status, column_id, id_cliente")
          .in("project_id", projetoIds);

        // Buscar clientes
        const clienteIds = [...new Set((projetosData ?? []).map((p) => p.id_cliente).filter(Boolean))];
        const { data: clientesData } = clienteIds.length > 0
          ? await supabase
              .from("metadata_clientes")
              .select("id, name")
              .in("id", clienteIds)
          : { data: [] };

        const clienteMap: Record<number, string> = {};
        for (const c of clientesData ?? []) {
          clienteMap[c.id] = c.name;
        }

        // Montar projetos com tarefas
        const projetosPayload = (projetosData ?? []).map((projeto) => {
          const tarefasDoProjeto = tarefasDoUsuario.filter(
            (t) => t.projeto_id === projeto.project_id
          );

          const tarefasPayload = tarefasDoProjeto.map((tarefa) => {
            const checklistItems = checklistByTarefaId[tarefa.id] ?? [];
            const checklistTotal = checklistItems.length;
            const checklistConcluidos = checklistItems.filter((c) => c.concluido).length;
            const checklistPendentes = checklistTotal - checklistConcluidos;

            return {
              id: tarefa.id,
              titulo: tarefa.titulo,
              status: tarefa.status,
              coluna: tarefaColunaMap[tarefa.column_id ?? ""] ?? tarefa.column_id,
              priority: tarefa.priority,
              priorizado: tarefa.priorizado,
              start_date: tarefa.start_date,
              due_date: tarefa.due_date,
              dataInicio: formatDate(tarefa.start_date),
              dataEntrega: formatDate(tarefa.due_date),
              descricao: tarefa.descricao,
              assigned_users: tarefa.assigned_users,
              checklist: checklistItems,
              checklist_total: checklistTotal,
              checklist_concluidos: checklistConcluidos,
              checklist_pendentes: checklistPendentes,
              // usados na interpolação
              projeto: projeto.company_name,
              checklistTotal,
              checklistPendentes,
            };
          });

          return {
            id: projeto.project_id,
            nome: projeto.company_name,
            status: projeto.status,
            coluna: projetoColunaMap[projeto.column_id ?? ""] ?? projeto.column_id,
            cliente: projeto.id_cliente
              ? { id: projeto.id_cliente, nome: clienteMap[projeto.id_cliente] ?? "" }
              : null,
            tarefas: tarefasPayload,
          };
        });

        // Gerar perguntas interpoladas para cada tarefa
        const perguntasInterpoladas: string[] = [];
        for (const projeto of projetosPayload) {
          for (const tarefa of projeto.tarefas) {
            for (const q of questions) {
              perguntasInterpoladas.push(
                interpolateQuestion(q.text, tarefa as Record<string, unknown>, {
                  nome: profile.full_name ?? profile.email ?? cfg.user_id,
                })
              );
            }
          }
        }

        // Montar resumo
        const totalTarefas = tarefasDoUsuario.length;
        const totalChecklistPendentes = projetosPayload
          .flatMap((p) => p.tarefas)
          .reduce((acc, t) => acc + t.checklist_pendentes, 0);

        // Payload final para o n8n
        const payload = {
          modo: "MensagemDev",
          usuario: {
            id: cfg.user_id,
            nome: profile.full_name ?? "",
            email: profile.email ?? "",
            whatsapp: profile.whatsapp_phone,
          },
          context: {
            data_envio: nowBrasil.toISOString().split("T")[0],
            dia_semana: DIAS_SEMANA[diaSemana],
            horario_configurado: horaAtual,
          },
          projetos: projetosPayload,
          perguntas: perguntasInterpoladas,
          resumo: {
            total_projetos: projetosPayload.length,
            total_tarefas: totalTarefas,
            total_checklist_pendentes: totalChecklistPendentes,
          },
        };

        // Enviar webhook para o n8n
        const webhookResp = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!webhookResp.ok) {
          const errText = await webhookResp.text();
          results.push({
            userId: cfg.user_id,
            status: "failed",
            error: `n8n retornou ${webhookResp.status}: ${errText}`,
          });
        } else {
          results.push({ userId: cfg.user_id, status: "sent" });
        }
      } catch (userErr) {
        results.push({
          userId: cfg.user_id,
          status: "error",
          error: (userErr as Error).message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        hora: horaAtual,
        dia_semana: DIAS_SEMANA[diaSemana],
        processados: results.length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

