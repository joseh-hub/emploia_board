import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing X-API-Key header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash the API key and check against stored hashes
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const { data: apiKeyRecord, error: keyError } = await supabase
      .from("webhook_api_keys")
      .select("*")
      .eq("key_hash", keyHash)
      .eq("is_active", true)
      .single();

    if (keyError || !apiKeyRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid or inactive API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last used timestamp
    await supabase
      .from("webhook_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyRecord.id);

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // Expected paths: /webhook-inbound/cards, /webhook-inbound/cards/:id/done

    const method = req.method;
    const body = method !== "GET" ? await req.json() : {};

    // POST /webhook-inbound/cards - Create a new card
    if (method === "POST" && pathParts[pathParts.length - 1] === "cards") {
      const { board_id, column_id, title, description, priority, due_date, tags } = body;

      if (!board_id || !title) {
        return new Response(
          JSON.stringify({ error: "board_id and title are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If no column_id, get the first column of the board
      let targetColumnId = column_id;
      if (!targetColumnId) {
        const { data: columns } = await supabase
          .from("custom_board_columns")
          .select("id")
          .eq("board_id", board_id)
          .order("position", { ascending: true })
          .limit(1);

        if (columns && columns.length > 0) {
          targetColumnId = columns[0].id;
        }
      }

      // Get max position in column
      const { data: existing } = await supabase
        .from("custom_board_cards")
        .select("position")
        .eq("column_id", targetColumnId)
        .order("position", { ascending: false })
        .limit(1);

      const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

      const { data: card, error: insertError } = await supabase
        .from("custom_board_cards")
        .insert({
          board_id,
          column_id: targetColumnId,
          title,
          description: description || null,
          priority: priority || "medium",
          due_date: due_date || null,
          tags: tags || [],
          position,
          created_by: apiKeyRecord.user_id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create automation event for card creation
      await supabase.from("automation_events").insert({
        event_type: "created",
        entity_type: "custom_board_card",
        entity_id: card.id,
        board_id,
        card_data: card,
        user_id: apiKeyRecord.user_id,
      });

      return new Response(
        JSON.stringify({ success: true, card }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /webhook-inbound/cards/:id/done - Mark card as done
    if (method === "POST" && pathParts.includes("done")) {
      const cardIdIndex = pathParts.indexOf("cards") + 1;
      const cardId = pathParts[cardIdIndex];

      if (!cardId) {
        return new Response(
          JSON.stringify({ error: "Card ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get the card
      const { data: card, error: cardError } = await supabase
        .from("custom_board_cards")
        .select("*, custom_board_columns!inner(is_done_column)")
        .eq("id", cardId)
        .single();

      if (cardError || !card) {
        return new Response(
          JSON.stringify({ error: "Card not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find the done column for this board
      const { data: doneColumn } = await supabase
        .from("custom_board_columns")
        .select("id")
        .eq("board_id", card.board_id)
        .eq("is_done_column", true)
        .single();

      if (doneColumn) {
        await supabase
          .from("custom_board_cards")
          .update({ column_id: doneColumn.id, updated_at: new Date().toISOString() })
          .eq("id", cardId);
      }

      // Create automation event
      await supabase.from("automation_events").insert({
        event_type: "card_done",
        entity_type: "custom_board_card",
        entity_id: cardId,
        board_id: card.board_id,
        card_data: card,
        user_id: apiKeyRecord.user_id,
      });

      return new Response(
        JSON.stringify({ success: true, message: "Card marked as done" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PATCH /webhook-inbound/cards/:id - Update a card
    if (method === "PATCH" && pathParts.includes("cards")) {
      const cardIdIndex = pathParts.indexOf("cards") + 1;
      const cardId = pathParts[cardIdIndex];

      if (!cardId || cardId === "done") {
        return new Response(
          JSON.stringify({ error: "Card ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { title, description, priority, due_date, column_id, tags } = body;

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (due_date !== undefined) updateData.due_date = due_date;
      if (column_id !== undefined) updateData.column_id = column_id;
      if (tags !== undefined) updateData.tags = tags;

      const { data: card, error: updateError } = await supabase
        .from("custom_board_cards")
        .update(updateData)
        .eq("id", cardId)
        .select()
        .single();

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, card }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown endpoint" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook inbound error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
