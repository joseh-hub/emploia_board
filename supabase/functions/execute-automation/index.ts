import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AutomationEvent {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  board_id: string | null;
  card_data: Record<string, unknown> | null;
  user_id: string | null;
  processed: boolean;
  created_at: string;
}

interface Automation {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  entity_type: string;
  is_active: boolean;
  scope: string | null;
  board_id: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get unprocessed events
    const { data: events, error: eventsError } = await supabase
      .from("automation_events")
      .select("*")
      .eq("processed", false)
      .order("created_at", { ascending: true })
      .limit(50);

    if (eventsError) throw eventsError;

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: "No events to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{ eventId: string; automationsExecuted: number; errors: string[] }> = [];

    for (const event of events as AutomationEvent[]) {
      const eventResults = { eventId: event.id, automationsExecuted: 0, errors: [] as string[] };

      // Find matching automations
      const { data: automations, error: automationsError } = await supabase
        .from("automations")
        .select("*")
        .eq("is_active", true)
        .eq("trigger_type", event.event_type);

      if (automationsError) {
        eventResults.errors.push(`Failed to fetch automations: ${automationsError.message}`);
        results.push(eventResults);
        continue;
      }

      // Filter automations by scope
      const matchingAutomations = (automations as Automation[])?.filter((auto) => {
        // Global automations always match
        if (auto.scope === "global" || !auto.scope) return true;
        // Board-specific automations must match the board_id
        if (auto.scope === "board" && auto.board_id) {
          return auto.board_id === event.board_id;
        }
        return false;
      }) || [];

      for (const automation of matchingAutomations) {
        try {
          await executeAction(supabase, automation, event);
          eventResults.automationsExecuted++;

          // Log success
          await supabase.from("automation_logs").insert({
            automation_id: automation.id,
            trigger_data: event.card_data,
            action_result: { success: true },
            status: "success",
          });
        } catch (actionError) {
          const errorMessage = actionError instanceof Error ? actionError.message : String(actionError);
          eventResults.errors.push(`Automation ${automation.id}: ${errorMessage}`);

          // Log failure
          await supabase.from("automation_logs").insert({
            automation_id: automation.id,
            trigger_data: event.card_data,
            action_result: { success: false },
            status: "failed",
            error_message: errorMessage,
          });
        }
      }

      // Mark event as processed
      await supabase
        .from("automation_events")
        .update({ processed: true })
        .eq("id", event.id);

      results.push(eventResults);
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Execute automation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function executeAction(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  automation: Automation,
  event: AutomationEvent
) {
  const { action_type, action_config } = automation;
  const cardData = event.card_data || {};

  console.log(`[Automation] Executing action: ${action_type} for automation: "${automation.name}" (ID: ${automation.id})`);
  console.log(`[Automation] Event data:`, JSON.stringify({ 
    event_type: event.event_type, 
    entity_id: event.entity_id, 
    board_id: event.board_id 
  }));

  switch (action_type) {
    case "webhook": {
      const url = action_config.url as string;
      const method = (action_config.method as string) || "POST";
      const headers = (action_config.headers as Record<string, string>) || {};

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: method !== "GET" ? JSON.stringify({
          event_type: event.event_type,
          entity_type: event.entity_type,
          entity_id: event.entity_id,
          board_id: event.board_id,
          card: cardData,
          automation_name: automation.name,
          triggered_at: new Date().toISOString(),
        }) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }
      console.log(`[Automation] Webhook sent successfully to ${url}`);
      break;
    }

    case "notification": {
      const title = (action_config.title as string) || "Automação executada";
      const message = (action_config.message as string) || `Card "${cardData.title || "sem título"}" processado`;

      console.log(`[Automation] Creating notification for user ${event.user_id}: "${title}"`);
      
      // Create notification for the user who triggered the event
      if (event.user_id) {
        const { error: notifError } = await supabase.from("notifications").insert({
          user_id: event.user_id,
          title,
          message: interpolateTemplate(message, cardData),
          type: "automation",
          entity_type: event.entity_type,
          entity_id: event.entity_id,
        });
        
        if (notifError) {
          console.error(`[Automation] Failed to create notification:`, notifError);
          throw new Error(`Failed to create notification: ${notifError.message}`);
        }
        console.log(`[Automation] Notification created successfully`);
      } else {
        console.warn(`[Automation] No user_id in event, skipping notification`);
      }
      break;
    }

    case "move_column": {
      const columnId = action_config.column_id as string;
      if (!columnId) throw new Error("Column ID not configured");

      console.log(`[Automation] Moving card ${event.entity_id} to column ${columnId}`);
      const { error: moveError } = await supabase
        .from("custom_board_cards")
        .update({ column_id: columnId, updated_at: new Date().toISOString() })
        .eq("id", event.entity_id);
      
      if (moveError) {
        console.error(`[Automation] Failed to move card:`, moveError);
        throw new Error(`Failed to move card: ${moveError.message}`);
      }
      console.log(`[Automation] Card moved successfully`);
      break;
    }

    case "assign": {
      const userId = action_config.user_id as string;
      if (!userId) throw new Error("User ID not configured");

      console.log(`[Automation] Assigning user ${userId} to card ${event.entity_id}`);
      const { data: card } = await supabase
        .from("custom_board_cards")
        .select("assigned_users")
        .eq("id", event.entity_id)
        .single();

      const currentUsers = (card?.assigned_users || []) as string[];
      if (!currentUsers.includes(userId)) {
        const { error: assignError } = await supabase
          .from("custom_board_cards")
          .update({
            assigned_users: [...currentUsers, userId],
            updated_at: new Date().toISOString(),
          })
          .eq("id", event.entity_id);
        
        if (assignError) {
          console.error(`[Automation] Failed to assign user:`, assignError);
          throw new Error(`Failed to assign user: ${assignError.message}`);
        }
        console.log(`[Automation] User assigned successfully`);
      } else {
        console.log(`[Automation] User ${userId} already assigned, skipping`);
      }
      break;
    }

    default:
      throw new Error(`Unknown action type: ${action_type}`);
  }
}

function interpolateTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return String(data[key] ?? "");
  });
}
