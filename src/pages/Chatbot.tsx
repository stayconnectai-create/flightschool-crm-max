import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Plus, Trash2, Copy, Check, MessageSquare, UserPlus, Settings as Cog, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Faq = { id: string; question: string; answer: string; sort_order: number };
type Settings = { user_id: string; school_name: string; info: string; bot_greeting: string; primary_color: string };
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
};
type Conversation = {
  id: string;
  visitor_id: string;
  source_url: string | null;
  lead_captured: boolean;
  message_count: number;
  created_at: string;
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
        const { data: created } = await supabase
          .from("school_settings")
          .insert({ user_id: user.id })
          .select()
          .single();
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

  if (!user || loading || !settings) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> Website Chatbot
          </h1>
          <p className="text-sm text-muted-foreground">
            AI assistant for your website that answers FAQs and captures leads automatically.
          </p>
        </div>
      </div>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup"><Cog className="h-4 w-4 mr-1.5" /> Setup</TabsTrigger>
          <TabsTrigger value="faqs"><MessageSquare className="h-4 w-4 mr-1.5" /> FAQs ({faqs.length})</TabsTrigger>
          <TabsTrigger value="leads"><UserPlus className="h-4 w-4 mr-1.5" /> Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="conversations">Conversations ({conversations.length})</TabsTrigger>
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
          />
        </TabsContent>

        <TabsContent value="embed">
          <EmbedTab userId={user.id} settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SetupTab({ settings, onSave, userId }: { settings: Settings; onSave: (s: Settings) => void; userId: string }) {
  const [local, setLocal] = useState(settings);
  const [saving, setSaving] = useState(false);
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Personality & Info</CardTitle>
        <CardDescription>This info is given to the AI as context for every conversation.</CardDescription>
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
              <Input
                type="color"
                value={local.primary_color}
                onChange={(e) => setLocal({ ...local, primary_color: e.target.value })}
                className="w-16 p-1 h-10"
              />
              <Input value={local.primary_color} onChange={(e) => setLocal({ ...local, primary_color: e.target.value })} />
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Greeting message</label>
          <Input value={local.bot_greeting} onChange={(e) => setLocal({ ...local, bot_greeting: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium">About your school / business info</label>
          <Textarea
            value={local.info}
            onChange={(e) => setLocal({ ...local, info: e.target.value })}
            rows={10}
            placeholder="Describe your school: location, programs offered, pricing ranges, hours, instructors, fleet, what makes you unique. The more detail, the better the bot will answer."
          />
          <p className="text-xs text-muted-foreground mt-1">{local.info.length} characters</p>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save settings"}</Button>
      </CardContent>
    </Card>
  );
}

function FaqsTab({ faqs, setFaqs, userId }: { faqs: Faq[]; setFaqs: (f: Faq[]) => void; userId: string }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  async function add() {
    if (!q.trim() || !a.trim()) return;
    const { data, error } = await supabase
      .from("faqs")
      .insert({ user_id: userId, question: q, answer: a, sort_order: faqs.length })
      .select()
      .single();
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
    return <p className="text-sm text-muted-foreground text-center py-12">No leads captured yet. Once visitors share their contact info, they'll appear here.</p>;
  }
  return (
    <div className="space-y-2">
      {leads.map((l) => (
        <motion.div key={l.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{l.name ?? "Anonymous"}</p>
                    <Badge variant="secondary">{l.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    {l.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{l.email}</span>}
                    {l.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{l.phone}</span>}
                  </div>
                  {l.interest && <p className="text-sm mt-2"><span className="text-muted-foreground">Interest: </span>{l.interest}</p>}
                  {l.notes && <p className="text-sm mt-1 text-muted-foreground">{l.notes}</p>}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {new Date(l.created_at).toLocaleString()}
                  {l.source_url && <div className="mt-1 truncate max-w-[200px]" title={l.source_url}>{new URL(l.source_url).hostname}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function ConversationsTab({
  conversations, active, setActive, messages,
}: { conversations: Conversation[]; active: string | null; setActive: (id: string | null) => void; messages: Msg[] }) {
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
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">{c.visitor_id.slice(0, 8)}</span>
                {c.lead_captured && <Badge variant="default" className="text-[10px]">Lead</Badge>}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {c.message_count} msgs · {new Date(c.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader><CardTitle className="text-base">Transcript</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
          {!active && <p className="text-sm text-muted-foreground">Select a conversation</p>}
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

  const scriptSnippet = `<script src="${origin}/skylead-widget.js"
  data-workspace="${userId}"
  data-title="${settings.school_name}"
  data-color="${color}"
  data-greeting="${settings.bot_greeting}"></script>`;

  const iframeSnippet = `<iframe
  src="${origin}/chatbot.html?w=${userId}&c=${color}&t=${title}&g=${greeting}"
  style="width:380px;height:560px;border:0;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.15);"
  title="Chat"></iframe>`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Floating bubble (recommended)</CardTitle>
          <CardDescription>Paste this before <code>&lt;/body&gt;</code> on your website. Shows a chat bubble in the bottom-right corner.</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock code={scriptSnippet} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Inline iframe</CardTitle>
          <CardDescription>Embeds the chat directly into a section of your page.</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock code={iframeSnippet} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Live preview</CardTitle>
          <CardDescription>Test the chatbot exactly as visitors will see it.</CardDescription>
        </CardHeader>
        <CardContent>
          <iframe
            src={`/chatbot.html?w=${userId}&c=${color}&t=${title}&g=${greeting}`}
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
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2"
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
