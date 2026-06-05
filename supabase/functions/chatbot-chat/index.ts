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
  request_handoff?: boolean; // explicit "talk to human" button
}

const tools = [
  {
    type: "function",
    function: {
      name: "capture_lead",
      description:
        "Save the visitor's contact info as a general inquiry lead. Call once you have a name AND (email OR phone). Use this for normal interest, NOT for booking a discovery flight (use book_discovery_flight for that).",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Visitor's full name" },
          email: { type: "string", description: "Visitor's email address" },
          phone: { type: "string", description: "Visitor's phone number" },
          interest: {
            type: "string",
            description: "What the visitor is interested in (e.g. 'Private pilot course', 'Pricing')",
          },
          notes: { type: "string", description: "Any other useful context from the conversation" },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_discovery_flight",
      description:
        "Book a discovery flight or lesson. Call when the visitor wants to schedule/book a flight and you have their name, contact info (email or phone), and preferred date/time.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          program: {
            type: "string",
            description: "Which program (e.g. 'Discovery Flight', 'Private Pilot Intro Lesson')",
          },
          preferred_date: {
            type: "string",
            description: "Preferred date and time in natural language (e.g. 'Saturday June 14th, morning')",
          },
          notes: { type: "string" },
        },
        required: ["name", "preferred_date"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "request_human_handoff",
      description:
        "Flag this conversation for the school staff to follow up personally. Call when the visitor explicitly asks to talk to a person, has a complex question you cannot answer, or seems frustrated.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Why a human is needed" },
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
        },
        required: ["reason"],
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

    // Explicit handoff button bypasses the LLM
    if (body.request_handoff) {
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        user_id: body.workspace_id,
        role: "user",
        content: body.message,
      });
      await supabase
        .from("chat_conversations")
        .update({ needs_human: true, handoff_at: new Date().toISOString() })
        .eq("id", conversationId);
      const reply =
        "Got it — I've flagged this conversation so a team member can follow up personally. If you'd like to leave your name and email or phone, I'll make sure they reach out as soon as possible.";
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        user_id: body.workspace_id,
        role: "assistant",
        content: reply,
      });
      return json({ conversation_id: conversationId, reply, handoff: true });
    }

    // 2. Save the user message
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      user_id: body.workspace_id,
      role: "user",
      content: body.message,
    });

    // 3. Load context
    const [{ data: settings }, { data: faqs }, { data: history }, { data: convRow }] = await Promise.all([
      supabase.from("school_settings").select("*").eq("user_id", body.workspace_id).maybeSingle(),
      supabase.from("faqs").select("question,answer").eq("user_id", body.workspace_id).order("sort_order"),
      supabase
        .from("chat_messages")
        .select("role,content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(40),
      supabase
        .from("chat_conversations")
        .select("message_count,lead_captured,needs_human")
        .eq("id", conversationId)
        .single(),
    ]);

    const schoolName = settings?.school_name ?? "this flight school";
    const info = settings?.info ?? "";
    const programs = settings?.programs ?? "";
    const bookingEnabled = settings?.booking_enabled ?? true;
    const faqText =
      (faqs ?? [])
        .map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`)
        .join("\n\n") || "(no FAQs configured)";

    const totalMsgs = (convRow?.message_count ?? 0) + 1;
    const leadAlready = convRow?.lead_captured ?? false;

    const system = `You are a friendly, professional AI assistant for ${schoolName}, embedded on their website.

Your jobs, in order:
1. Answer visitor questions using the SCHOOL INFO, PROGRAMS, and FAQs below. Be warm and concise.
2. If a question is outside your knowledge, say so honestly and offer to have a human follow up (use request_human_handoff if they agree).
3. After ~3 user messages, if the visitor seems interested and we don't have their contact info yet, naturally ask for their name, email, and phone so the team can follow up. Don't be pushy.
4. If the visitor wants to BOOK a discovery flight or schedule a lesson${bookingEnabled ? "" : " (booking is currently disabled — capture as a lead instead)"}, gather their name, contact info, and preferred date/time, then call book_discovery_flight.
5. For general interest, once you have a name AND (email OR phone), call capture_lead.
6. If the visitor asks to talk to a person, sounds frustrated, or has a question you genuinely cannot answer, call request_human_handoff.

Rules:
- Never invent prices, schedules, or details not in the info below. Defer to the team.
- Keep replies under 4 short sentences unless the visitor asks for detail.
- Do not call capture_lead or book_discovery_flight more than once per conversation.
- Lead already captured this conversation: ${leadAlready ? "YES — do NOT call capture_lead or book_discovery_flight again" : "no"}
- Messages in this conversation so far (including this one): ${totalMsgs}

=== SCHOOL INFO ===
${info || "(none provided)"}

=== PROGRAMS / COURSES ===
${programs || "(not specified — defer pricing & scheduling to the team)"}

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
        tools,
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
    let bookingCreated = false;
    let handoffRequested = false;

    const toolCalls = choice.tool_calls ?? [];
    for (const tc of toolCalls) {
      const fname = tc.function?.name;
      let args: Record<string, string> = {};
      try { args = JSON.parse(tc.function?.arguments ?? "{}"); } catch { /* ignore */ }

      if (fname === "capture_lead" && !leadAlready && args.name && (args.email || args.phone)) {
        await supabase.from("chatbot_leads").insert({
          user_id: body.workspace_id,
          conversation_id: conversationId,
          name: args.name,
          email: args.email ?? null,
          phone: args.phone ?? null,
          interest: args.interest ?? null,
          notes: args.notes ?? null,
          source_url: body.source_url ?? null,
          lead_type: "inquiry",
        });
        await supabase.from("chat_conversations").update({ lead_captured: true }).eq("id", conversationId);
        leadCaptured = true;
        if (!reply) reply = `Thanks ${args.name.split(" ")[0]}! Someone will reach out shortly.`;
      }

      if (fname === "book_discovery_flight" && !leadAlready && args.name) {
        await supabase.from("chatbot_leads").insert({
          user_id: body.workspace_id,
          conversation_id: conversationId,
          name: args.name,
          email: args.email ?? null,
          phone: args.phone ?? null,
          program: args.program ?? "Discovery Flight",
          preferred_date: args.preferred_date ?? null,
          interest: args.program ? `Booking: ${args.program}` : "Discovery flight booking",
          notes: args.notes ?? null,
          source_url: body.source_url ?? null,
          lead_type: "booking",
        });
        await supabase.from("chat_conversations").update({ lead_captured: true }).eq("id", conversationId);
        bookingCreated = true;
        leadCaptured = true;
        if (!reply)
          reply = `Awesome ${args.name.split(" ")[0]}! I've sent your booking request for ${args.preferred_date}. The team will confirm shortly.`;
      }

      if (fname === "request_human_handoff") {
        await supabase
          .from("chat_conversations")
          .update({ needs_human: true, handoff_at: new Date().toISOString() })
          .eq("id", conversationId);
        // also capture contact if provided
        if (args.name && (args.email || args.phone) && !leadAlready) {
          await supabase.from("chatbot_leads").insert({
            user_id: body.workspace_id,
            conversation_id: conversationId,
            name: args.name,
            email: args.email ?? null,
            phone: args.phone ?? null,
            notes: args.reason ?? null,
            source_url: body.source_url ?? null,
            lead_type: "human_handoff",
          });
          await supabase.from("chat_conversations").update({ lead_captured: true }).eq("id", conversationId);
          leadCaptured = true;
        }
        handoffRequested = true;
        if (!reply) reply = "I've flagged this for a team member to follow up with you personally.";
      }
    }

    if (!reply) reply = "Sorry, I didn't catch that — could you rephrase?";

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

    return json({
      conversation_id: conversationId,
      reply,
      lead_captured: leadCaptured,
      booking_created: bookingCreated,
      handoff: handoffRequested,
    });
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
