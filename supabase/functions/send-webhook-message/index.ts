import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { groupid, mensagem } = await req.json();

    if (!groupid || !mensagem) {
      return new Response(
        JSON.stringify({ error: "groupid e mensagem são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const webhookUrl = Deno.env.get("N8N_WEBHOOK_URL") ?? "https://n8n.agenciaarms.com/webhook-test/receber-mensagem";

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modo: "MensagemGrupo", groupid, mensagem }),
    });

    const responseText = await webhookResponse.text();

    return new Response(
      JSON.stringify({ success: true, status: webhookResponse.status, response: responseText }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
