// Public chatbot endpoint — used by embeddable widget on client websites.
// No JWT required; uses service role to write on the visitor's behalf.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

interface Body {
  workspace_id: string;
  visitor_id: string;
  conversation_id?: string;
  message: string;
  source_url?: string;
  user_agent?: string;
}

const tools = [
  {
    type: "function",
    function: {
      name: "capture_lead",
      description:
        "Save the visitor's contact info as a lead. ONLY call once you have at least a name AND (email OR phone). Do not call with placeholders.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Visitor's full name" },
          email: { type: "string", description: "Visitor's email address" },
          phone: { type: "string", description: "Visitor's phone number" },
          interest: {
            type: "string",
            description:
              "What the visitor is interested in (e.g. 'Private pilot course', 'Discovery flight', 'Pricing')",
          },
          notes: { type: "string", description: "Any other useful context from the conversation" },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body.workspace_id || !body.visitor_id || !body.message) {
      return json({ error: "workspace_id, visitor_id and message are required" }, 400);
    }

    // 1. Get or create conversation
    let conversationId = body.conversation_id;
    if (!conversationId) {
      const { data: conv, error: convErr } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: body.workspace_id,
          visitor_id: body.visitor_id,
          source_url: body.source_url ?? null,
          user_agent: body.user_agent ?? null,
        })
        .select("id")
        .single();
      if (convErr) throw convErr;
      conversationId = conv.id;
    }

    // 2. Save the user message
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      user_id: body.workspace_id,
      role: "user",
      content: body.message,
    });

    // 3. Load context: FAQs + school info + recent messages + lead-captured flag
    const [{ data: settings }, { data: faqs }, { data: history }, { data: convRow }] = await Promise.all([
      supabase.from("school_settings").select("*").eq("user_id", body.workspace_id).maybeSingle(),
      supabase.from("faqs").select("question,answer").eq("user_id", body.workspace_id).order("sort_order"),
      supabase
        .from("chat_messages")
        .select("role,content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(40),
      supabase.from("chat_conversations").select("message_count,lead_captured").eq("id", conversationId).single(),
    ]);

    const schoolName = settings?.school_name ?? "this flight school";
    const info = settings?.info ?? "";
    const faqText =
      (faqs ?? [])
        .map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`)
        .join("\n\n") || "(no FAQs configured)";

    const totalMsgs = (convRow?.message_count ?? 0) + 1;
    const leadAlready = convRow?.lead_captured ?? false;

    const system = `You are a friendly, professional AI assistant for ${schoolName}, embedded on their website.

Your jobs, in order:
1. Answer visitor questions using the SCHOOL INFO and FAQs below. Be warm and concise.
2. If a question is outside your knowledge, say so honestly and offer to have a human follow up.
3. After ~3 user messages, if the visitor seems interested and we don't have their contact info yet, naturally ask for their name, email, and (optionally) phone so the team can follow up. Don't be pushy.
4. Once you have a name AND (email OR phone), call the capture_lead tool with what you have. Then thank them and let them know someone will be in touch.

Rules:
- Never invent prices, schedules, or details not in the info below. Defer to the team.
- Keep replies under 4 short sentences unless the visitor asks for detail.
- Do not call capture_lead more than once per conversation.
- Lead already captured this conversation: ${leadAlready ? "YES — do NOT call capture_lead again" : "no"}
- Messages in this conversation so far (including this one): ${totalMsgs}

=== SCHOOL INFO ===
${info || "(none provided)"}

=== FAQs ===
${faqText}`;

    const messages = [
      { role: "system", content: system },
      ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
    ];

    // 4. Call Lovable AI Gateway
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: leadAlready ? undefined : tools,
      }),
    });

    if (aiRes.status === 429) return json({ error: "Rate limit, please slow down." }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted." }, 402);
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      return json({ error: "AI request failed" }, 500);
    }

    const aiData = await aiRes.json();
    const choice = aiData.choices?.[0]?.message ?? {};
    let reply: string = choice.content ?? "";
    let leadCaptured = false;

    // 5. Handle capture_lead tool call
    const toolCalls = choice.tool_calls ?? [];
    for (const tc of toolCalls) {
      if (tc.function?.name === "capture_lead") {
        try {
          const args = JSON.parse(tc.function.arguments ?? "{}");
          if (args.name && (args.email || args.phone)) {
            await supabase.from("chatbot_leads").insert({
              user_id: body.workspace_id,
              conversation_id: conversationId,
              name: args.name ?? null,
              email: args.email ?? null,
              phone: args.phone ?? null,
              interest: args.interest ?? null,
              notes: args.notes ?? null,
              source_url: body.source_url ?? null,
            });
            await supabase
              .from("chat_conversations")
              .update({ lead_captured: true })
              .eq("id", conversationId);
            leadCaptured = true;
            if (!reply) {
              reply = `Thanks ${args.name.split(" ")[0]}! I've passed your info to the team — someone will reach out shortly. Anything else I can answer in the meantime?`;
            }
          }
        } catch (e) {
          console.error("tool parse error", e);
        }
      }
    }

    if (!reply) reply = "Sorry, I didn't catch that — could you rephrase?";

    // 6. Save assistant message + bump counter
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      user_id: body.workspace_id,
      role: "assistant",
      content: reply,
    });
    await supabase
      .from("chat_conversations")
      .update({ message_count: totalMsgs + 1 })
      .eq("id", conversationId);

    return json({ conversation_id: conversationId, reply, lead_captured: leadCaptured });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
