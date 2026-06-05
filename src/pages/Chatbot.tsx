import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot, Plus, Trash2, Copy, Check, MessageSquare, UserPlus, Settings as Cog,
  Mail, Phone, Calendar, UserCheck, BarChart3, TrendingUp, AlertCircle, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Faq = { id: string; question: string; answer: string; sort_order: number };
type Settings = {
  user_id: string;
  school_name: string;
  info: string;
  bot_greeting: string;
  primary_color: string;
  proactive_message: string;
  proactive_delay: number;
  suggested_questions: string[];
  booking_enabled: boolean;
  programs: string;
  status_label: string;
};
type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  interest: string | null;
  notes: string | null;
  source_url: string | null;
  status: string;
  created_at: string;
  lead_type: string;
  preferred_date: string | null;
  program: string | null;
};
type Conversation = {
  id: string;
  visitor_id: string;
  source_url: string | null;
  lead_captured: boolean;
  message_count: number;
  created_at: string;
  needs_human: boolean;
  handoff_at: string | null;
};
type Msg = { id: string; role: string; content: string; created_at: string };

export default function Chatbot() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [convMessages, setConvMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [s, f, l, c] = await Promise.all([
        supabase.from("school_settings").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("faqs").select("*").eq("user_id", user.id).order("sort_order"),
        supabase.from("chatbot_leads").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("chat_conversations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      ]);
      if (!s.data) {
        const { data: created } = await supabase.from("school_settings").insert({ user_id: user.id }).select().single();
        setSettings(created as Settings);
      } else setSettings(s.data as Settings);
      setFaqs((f.data ?? []) as Faq[]);
      setLeads((l.data ?? []) as Lead[]);
      setConversations((c.data ?? []) as Conversation[]);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!activeConv) { setConvMessages([]); return; }
    supabase.from("chat_messages").select("*").eq("conversation_id", activeConv).order("created_at")
      .then(({ data }) => setConvMessages((data ?? []) as Msg[]));
  }, [activeConv]);

  const pendingHandoffs = useMemo(() => conversations.filter((c) => c.needs_human), [conversations]);

  if (!user || loading || !settings) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> Website Chatbot
          </h1>
          <p className="text-sm text-muted-foreground">
            AI assistant that answers questions, books discovery flights and captures leads automatically.
          </p>
        </div>
      </div>

      {pendingHandoffs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-5 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {pendingHandoffs.length} conversation{pendingHandoffs.length === 1 ? "" : "s"} waiting for a human reply
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A visitor has asked to talk to a person — open the Conversations tab to follow up.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <AnalyticsCards leads={leads} conversations={conversations} />

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="setup"><Cog className="h-4 w-4 mr-1.5" /> Setup</TabsTrigger>
          <TabsTrigger value="faqs"><MessageSquare className="h-4 w-4 mr-1.5" /> FAQs ({faqs.length})</TabsTrigger>
          <TabsTrigger value="leads"><UserPlus className="h-4 w-4 mr-1.5" /> Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="conversations">
            Conversations ({conversations.length})
            {pendingHandoffs.length > 0 && (
              <Badge variant="default" className="ml-1.5 h-5 px-1.5 text-[10px]">{pendingHandoffs.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <SetupTab settings={settings} onSave={setSettings} userId={user.id} />
        </TabsContent>
        <TabsContent value="faqs">
          <FaqsTab faqs={faqs} setFaqs={setFaqs} userId={user.id} />
        </TabsContent>
        <TabsContent value="leads">
          <LeadsTab leads={leads} />
        </TabsContent>
        <TabsContent value="conversations">
          <ConversationsTab
            conversations={conversations}
            active={activeConv}
            setActive={setActiveConv}
            messages={convMessages}
            onResolveHandoff={async (id) => {
              await supabase.from("chat_conversations").update({ needs_human: false }).eq("id", id);
              setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, needs_human: false } : c)));
              toast.success("Handoff marked as resolved");
            }}
          />
        </TabsContent>
        <TabsContent value="embed">
          <EmbedTab userId={user.id} settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsCards({ leads, conversations }: { leads: Lead[]; conversations: Conversation[] }) {
  const total = conversations.length;
  const withLead = conversations.filter((c) => c.lead_captured).length;
  const rate = total ? Math.round((withLead / total) * 100) : 0;
  const bookings = leads.filter((l) => l.lead_type === "booking").length;
  const weekAgo = Date.now() - 7 * 86400000;
  const leadsThisWeek = leads.filter((l) => new Date(l.created_at).getTime() > weekAgo).length;

  const stats = [
    { label: "Conversations", value: total, icon: MessageSquare },
    { label: "Leads captured", value: leads.length, icon: UserPlus, sub: `${leadsThisWeek} this week` },
    { label: "Discovery bookings", value: bookings, icon: Calendar },
    { label: "Conversion rate", value: `${rate}%`, icon: TrendingUp, sub: `${withLead}/${total || "0"} convos` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
                {s.sub && <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>}
              </div>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-4.5 w-4.5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SetupTab({ settings, onSave, userId }: { settings: Settings; onSave: (s: Settings) => void; userId: string }) {
  const [local, setLocal] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [newChip, setNewChip] = useState("");

  async function save() {
    setSaving(true);
    const { data, error } = await supabase
      .from("school_settings")
      .upsert({ ...local, user_id: userId })
      .select()
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    onSave(data as Settings);
    toast.success("Settings saved");
  }

  function addChip() {
    const v = newChip.trim();
    if (!v) return;
    if (local.suggested_questions.length >= 4) return toast.error("Max 4 suggestions");
    setLocal({ ...local, suggested_questions: [...local.suggested_questions, v] });
    setNewChip("");
  }
  function removeChip(i: number) {
    setLocal({ ...local, suggested_questions: local.suggested_questions.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Brand & greeting</CardTitle>
          <CardDescription>How the chatbot introduces itself to visitors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">School name</label>
              <Input value={local.school_name} onChange={(e) => setLocal({ ...local, school_name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Primary color</label>
              <div className="flex gap-2">
                <Input type="color" value={local.primary_color} onChange={(e) => setLocal({ ...local, primary_color: e.target.value })} className="w-16 p-1 h-10" />
                <Input value={local.primary_color} onChange={(e) => setLocal({ ...local, primary_color: e.target.value })} />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Greeting message</label>
            <Input value={local.bot_greeting} onChange={(e) => setLocal({ ...local, bot_greeting: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Status label (shown in chat header)</label>
            <Input
              value={local.status_label}
              onChange={(e) => setLocal({ ...local, status_label: e.target.value })}
              placeholder="Online — typically replies in a few minutes"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Quick-reply suggestions</CardTitle>
          <CardDescription>Tappable chips shown under the greeting. Visitors who tap one send it as a message. Max 4.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {local.suggested_questions.map((q, i) => (
              <Badge key={i} variant="secondary" className="text-sm py-1.5 pl-3 pr-1.5 gap-1">
                {q}
                <button onClick={() => removeChip(i)} className="hover:bg-muted-foreground/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {local.suggested_questions.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No suggestions yet — visitors will see just the greeting.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={newChip}
              onChange={(e) => setNewChip(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChip())}
              placeholder="e.g. Course pricing"
              maxLength={40}
            />
            <Button type="button" onClick={addChip} disabled={local.suggested_questions.length >= 4}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Discovery flight bookings</CardTitle>
          <CardDescription>When enabled, the AI can take booking requests (name, contact, preferred date) and log them as bookings in your Leads tab.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Enable booking flow</label>
            <Switch checked={local.booking_enabled} onCheckedChange={(v) => setLocal({ ...local, booking_enabled: v })} />
          </div>
          <div>
            <label className="text-sm font-medium">Programs & courses (for the AI to reference)</label>
            <Textarea
              value={local.programs}
              onChange={(e) => setLocal({ ...local, programs: e.target.value })}
              rows={4}
              placeholder="e.g. Discovery Flight (30 min, $149) · Private Pilot License (~$12k) · Instrument Rating · Commercial · Sport Pilot"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proactive engagement</CardTitle>
          <CardDescription>Pop a notification bubble after a delay to invite visitors to chat.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Proactive message</label>
              <Input
                value={local.proactive_message}
                onChange={(e) => setLocal({ ...local, proactive_message: e.target.value })}
                placeholder="Have questions about our courses? Ask me anything!"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Delay (seconds)</label>
              <Input
                type="number" min={0} max={300}
                value={local.proactive_delay}
                onChange={(e) => setLocal({ ...local, proactive_delay: parseInt(e.target.value || "10", 10) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About your school (AI knowledge base)</CardTitle>
          <CardDescription>The more detail you provide, the better the bot will answer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={local.info}
            onChange={(e) => setLocal({ ...local, info: e.target.value })}
            rows={10}
            placeholder="Location, programs, pricing ranges, hours, instructors, fleet, what makes you unique."
          />
          <p className="text-xs text-muted-foreground">{local.info.length} characters</p>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} disabled={saving} size="lg" className="shadow-lg">
          {saving ? "Saving..." : "Save all settings"}
        </Button>
      </div>
    </div>
  );
}

function FaqsTab({ faqs, setFaqs, userId }: { faqs: Faq[]; setFaqs: (f: Faq[]) => void; userId: string }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  async function add() {
    if (!q.trim() || !a.trim()) return;
    const { data, error } = await supabase
      .from("faqs").insert({ user_id: userId, question: q, answer: a, sort_order: faqs.length })
      .select().single();
    if (error) return toast.error(error.message);
    setFaqs([...faqs, data as Faq]);
    setQ(""); setA("");
    toast.success("FAQ added");
  }
  async function remove(id: string) {
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setFaqs(faqs.filter((f) => f.id !== id));
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add FAQ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Question (e.g. How much does the private pilot course cost?)" value={q} onChange={(e) => setQ(e.target.value)} />
          <Textarea placeholder="Answer" value={a} onChange={(e) => setA(e.target.value)} rows={3} />
          <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Add FAQ</Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {faqs.map((f) => (
          <Card key={f.id}>
            <CardContent className="pt-6 flex justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">{f.question}</p>
                <p className="text-sm text-muted-foreground mt-1">{f.answer}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(f.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {faqs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No FAQs yet. Add some above.</p>}
      </div>
    </div>
  );
}

function LeadsTab({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">No leads captured yet.</p>;
  }
  const typeMeta: Record<string, { label: string; cls: string; icon: typeof Calendar }> = {
    booking: { label: "Booking", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400", icon: Calendar },
    human_handoff: { label: "Wants human", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400", icon: UserCheck },
    inquiry: { label: "Inquiry", cls: "bg-primary/15 text-primary", icon: UserPlus },
  };
  return (
    <div className="space-y-2">
      {leads.map((l) => {
        const m = typeMeta[l.lead_type] ?? typeMeta.inquiry;
        const Icon = m.icon;
        return (
          <motion.div key={l.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{l.name ?? "Anonymous"}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${m.cls}`}>
                        <Icon className="h-3 w-3" /> {m.label}
                      </span>
                      <Badge variant="outline" className="text-xs">{l.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      {l.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{l.email}</span>}
                      {l.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{l.phone}</span>}
                    </div>
                    {l.program && <p className="text-sm mt-2"><span className="text-muted-foreground">Program: </span>{l.program}</p>}
                    {l.preferred_date && (
                      <p className="text-sm mt-1 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-muted-foreground">Preferred: </span>{l.preferred_date}
                      </p>
                    )}
                    {l.interest && !l.program && <p className="text-sm mt-2"><span className="text-muted-foreground">Interest: </span>{l.interest}</p>}
                    {l.notes && <p className="text-sm mt-1 text-muted-foreground">{l.notes}</p>}
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {new Date(l.created_at).toLocaleString()}
                    {l.source_url && <div className="mt-1 truncate max-w-[200px]" title={l.source_url}>{safeHost(l.source_url)}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function safeHost(u: string) { try { return new URL(u).hostname; } catch { return u; } }

function ConversationsTab({
  conversations, active, setActive, messages, onResolveHandoff,
}: {
  conversations: Conversation[]; active: string | null;
  setActive: (id: string | null) => void; messages: Msg[];
  onResolveHandoff: (id: string) => void;
}) {
  const activeConv = conversations.find((c) => c.id === active);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-1">
        <CardHeader><CardTitle className="text-base">Recent conversations</CardTitle></CardHeader>
        <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
          {conversations.length === 0 && <p className="text-sm text-muted-foreground">None yet</p>}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`w-full text-left p-2 rounded-md text-sm hover:bg-muted ${active === c.id ? "bg-muted" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs truncate">{c.visitor_id.slice(0, 8)}</span>
                <div className="flex gap-1">
                  {c.needs_human && <Badge variant="default" className="text-[10px] bg-blue-500 hover:bg-blue-500">Human</Badge>}
                  {c.lead_captured && <Badge variant="default" className="text-[10px]">Lead</Badge>}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {c.message_count} msgs · {new Date(c.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Transcript</CardTitle>
          {activeConv?.needs_human && (
            <Button size="sm" variant="outline" onClick={() => onResolveHandoff(activeConv.id)}>
              <Check className="h-3.5 w-3.5 mr-1" /> Mark resolved
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
          {!active && <p className="text-sm text-muted-foreground">Select a conversation</p>}
          {activeConv?.needs_human && (
            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 text-sm p-3 rounded-md flex items-start gap-2">
              <UserCheck className="h-4 w-4 mt-0.5 shrink-0" />
              <span>This visitor asked to talk to a person. Follow up using the contact info in their lead.</span>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`p-3 rounded-lg text-sm ${m.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}>
              <div className="text-xs font-medium text-muted-foreground mb-1">{m.role}</div>
              {m.content}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function EmbedTab({ userId, settings }: { userId: string; settings: Settings }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const color = settings.primary_color.replace(/^#/, "");
  const title = encodeURIComponent(settings.school_name);
  const greeting = encodeURIComponent(settings.bot_greeting);
  const statusEnc = encodeURIComponent(settings.status_label);
  const proactive = settings.proactive_message ? encodeURIComponent(settings.proactive_message) : "";
  const suggestions = settings.suggested_questions.join("|");
  const sugEnc = suggestions ? encodeURIComponent(suggestions) : "";
  const delay = settings.proactive_delay ?? 10;

  const scriptSnippet =
`<script src="${origin}/skylead-widget.js"
  data-workspace="${userId}"
  data-title="${settings.school_name}"
  data-color="${color}"
  data-greeting="${settings.bot_greeting}"
  data-status="${settings.status_label}"` +
    (suggestions ? `\n  data-suggestions="${suggestions}"` : "") +
    (settings.proactive_message ? `\n  data-proactive="${settings.proactive_message}"` : "") +
    `\n  data-proactive-delay="${delay}"></script>`;

  const previewSrc = `/chatbot.html?w=${userId}&c=${color}&t=${title}&g=${greeting}&s=${statusEnc}` +
    (sugEnc ? `&q=${sugEnc}` : "") + (proactive ? `&p=${proactive}` : "");

  const iframeSnippet =
`<iframe
  src="${origin}${previewSrc}"
  style="width:380px;height:560px;border:0;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.15);"
  title="Chat"></iframe>`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Floating bubble (recommended)</CardTitle>
          <CardDescription>Paste before <code>&lt;/body&gt;</code> on your website.</CardDescription>
        </CardHeader>
        <CardContent><CodeBlock code={scriptSnippet} /></CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Inline iframe</CardTitle>
          <CardDescription>Embeds the chat directly into a section of your page.</CardDescription>
        </CardHeader>
        <CardContent><CodeBlock code={iframeSnippet} /></CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Live preview</CardTitle>
          <CardDescription>Exactly what visitors will see.</CardDescription>
        </CardHeader>
        <CardContent>
          <iframe
            src={previewSrc}
            className="w-full max-w-[380px] h-[560px] rounded-2xl border shadow-md"
            title="Preview"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="bg-muted rounded-md p-4 text-xs overflow-x-auto"><code>{code}</code></pre>
      <Button
        size="sm" variant="ghost" className="absolute top-2 right-2"
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
