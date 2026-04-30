import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Fetch active clients with group_id
    const { data: clientes, error: clientesError } = await supabase
      .from("metadata_clientes")
      .select("id, name, group_id, status")
      .eq("status", "ATIVO")
      .not("group_id", "is", null);

    if (clientesError) throw clientesError;
    if (!clientes || clientes.length === 0) {
      return new Response(
        JSON.stringify({ suggestions: [], message: "Nenhum cliente ativo com grupo encontrado." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Filter out clients who had approved/edited comms in last 3 days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentComms } = await supabase
      .from("comunicacoes_sugeridas")
      .select("cliente_id")
      .in("status", ["aprovada", "editada"])
      .gte("resolved_at", threeDaysAgo);

    const recentClientIds = new Set((recentComms || []).map((c: any) => c.cliente_id));
    const eligibleClientes = clientes.filter((c: any) => !recentClientIds.has(c.id));

    if (eligibleClientes.length === 0) {
      return new Response(
        JSON.stringify({ suggestions: [], message: "Todos os clientes já foram contatados nos últimos 3 dias." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch projects for eligible clients
    const clienteIds = eligibleClientes.map((c: any) => c.id);
    const { data: projetos } = await supabase
      .from("projetos")
      .select("project_id, id_cliente, company_name, status")
      .in("id_cliente", clienteIds)
      .in("status", ["desenvolvimento", "producao", "ATIVO", "voo_solo"]);

    // 4. Fetch tasks for those projects
    const projetoIds = (projetos || []).map((p: any) => p.project_id);
    let tarefas: any[] = [];
    if (projetoIds.length > 0) {
      const { data } = await supabase
        .from("projeto_tarefas")
        .select("id, projeto_id, titulo, status, due_date, assigned_user")
        .in("projeto_id", projetoIds)
        .in("status", ["pendente", "em_progresso"])
        .order("due_date", { ascending: true });
      tarefas = data || [];
    }

    // 5. Fetch recent messages for each group
    const groupIds = eligibleClientes.map((c: any) => c.group_id).filter(Boolean);
    let allMessages: any[] = [];
    if (groupIds.length > 0) {
      const { data } = await supabase
        .from("group_messages")
        .select("session_id, message, senderName, timestamp")
        .in("session_id", groupIds)
        .order("timestamp", { ascending: false })
        .limit(200);
      allMessages = data || [];
    }

    // 6. Build context per client and call AI
    const suggestions: any[] = [];

    for (const cliente of eligibleClientes) {
      const clienteProjetos = (projetos || []).filter((p: any) => p.id_cliente === cliente.id);
      const clienteTarefas = tarefas.filter((t: any) =>
        clienteProjetos.some((p: any) => p.project_id === t.projeto_id)
      );
      const clienteMessages = allMessages
        .filter((m: any) => m.session_id === cliente.group_id)
        .slice(0, 20);

      const projetosContext = clienteProjetos
        .map((p: any) => `- ${p.company_name || "Sem nome"} | Status: ${p.status}`)
        .join("\n");

      const tarefasContext = clienteTarefas.length > 0
        ? clienteTarefas
            .map((t: any) => `- ${t.titulo} | Status: ${t.status} | Prazo: ${t.due_date || "sem prazo"}`)
            .join("\n")
        : "Nenhuma tarefa pendente.";

      const mensagensContext = clienteMessages.length > 0
        ? clienteMessages
            .map((m: any) => `- ${m.senderName || "?"}: ${(m.message || "").substring(0, 200)} (${m.timestamp || ""})`)
            .join("\n")
        : "Nenhuma mensagem recente.";

      const prompt = `Você é um assistente de CS da ARMS.

CLIENTE: ${cliente.name || "Sem nome"}

PROJETOS:
${projetosContext || "Nenhum projeto ativo."}

TAREFAS ABERTAS:
${tarefasContext}

ÚLTIMAS MENSAGENS NO GRUPO (mais recentes primeiro):
${mensagensContext}

REGRAS:
- Se tem tarefa atrasada → sugerir update proativo (tipo: alerta_atraso)
- Se tem tarefa concluída recentemente → sugerir aviso de entrega (tipo: entrega)
- Se não houve mensagem da ARMS nos últimos 3 dias → sugerir check-in (tipo: check_in)
- Se o projeto está em "voo_solo" → sugerir acompanhamento de resultado (tipo: acompanhamento)
- Se tem pendências financeiras → sugerir cobrança (tipo: cobranca)
- Para updates de progresso → tipo: update_tarefa
- Tom: profissional, amigável, direto. Máx 3 frases.

Analise o contexto e sugira UMA mensagem para este cliente.`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "Você é um assistente de CS que sugere mensagens para clientes." },
              { role: "user", content: prompt },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "suggest_message",
                  description: "Retorna uma sugestão de mensagem para o cliente.",
                  parameters: {
                    type: "object",
                    properties: {
                      mensagem: { type: "string", description: "A mensagem sugerida para enviar ao cliente." },
                      motivo: { type: "string", description: "O motivo pelo qual essa mensagem é recomendada." },
                      tipo_comunicacao: {
                        type: "string",
                        enum: ["update_tarefa", "check_in", "entrega", "cobranca", "acompanhamento", "alerta_atraso"],
                        description: "Categoria da comunicação.",
                      },
                    },
                    required: ["mensagem", "motivo", "tipo_comunicacao"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "suggest_message" } },
          }),
        });

        if (!aiResponse.ok) {
          const status = aiResponse.status;
          if (status === 429 || status === 402) {
            return new Response(
              JSON.stringify({
                error: status === 429
                  ? "Rate limit atingido. Tente novamente em alguns minutos."
                  : "Créditos insuficientes. Adicione créditos no workspace.",
              }),
              { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          console.error("AI error:", status, await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall) {
          console.error("No tool call in response for client", cliente.id);
          continue;
        }

        const args = JSON.parse(toolCall.function.arguments);
        const mainProjeto = clienteProjetos[0];

        // Save suggestion
        const { data: inserted, error: insertError } = await supabase
          .from("comunicacoes_sugeridas")
          .insert({
            cliente_id: cliente.id,
            projeto_id: mainProjeto?.project_id || null,
            group_id: cliente.group_id,
            mensagem_sugerida: args.mensagem,
            motivo: args.motivo,
            tipo_comunicacao: args.tipo_comunicacao,
            contexto: {
              projetos: clienteProjetos,
              tarefas: clienteTarefas.slice(0, 10),
              ultimas_mensagens: clienteMessages.slice(0, 5),
            },
            status: "pendente",
          })
          .select()
          .single();

        if (insertError) {
          console.error("Insert error:", insertError);
          continue;
        }

        suggestions.push({
          ...inserted,
          cliente_nome: cliente.name,
        });
      } catch (aiErr) {
        console.error("Error processing client", cliente.id, aiErr);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-client-comms error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
