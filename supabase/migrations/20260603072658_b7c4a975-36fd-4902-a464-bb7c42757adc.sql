
-- FAQs
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own faqs select" ON public.faqs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own faqs insert" ON public.faqs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own faqs update" ON public.faqs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users manage own faqs delete" ON public.faqs FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- School / business info (single row per user)
CREATE TABLE public.school_settings (
  user_id UUID PRIMARY KEY,
  school_name TEXT NOT NULL DEFAULT 'Our Flight School',
  info TEXT NOT NULL DEFAULT '',
  bot_greeting TEXT NOT NULL DEFAULT 'Hi! 👋 I''m here to help with any questions about our flight school. What can I help you with?',
  primary_color TEXT NOT NULL DEFAULT '#0EA5E9',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_settings TO authenticated;
GRANT ALL ON public.school_settings TO service_role;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own settings" ON public.school_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own settings" ON public.school_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own settings" ON public.school_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER school_settings_updated_at BEFORE UPDATE ON public.school_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chatbot-captured leads
CREATE TABLE public.chatbot_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  interest TEXT,
  source_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chatbot_leads TO authenticated;
GRANT ALL ON public.chatbot_leads TO service_role;
ALTER TABLE public.chatbot_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own bot leads" ON public.chatbot_leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own bot leads" ON public.chatbot_leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own bot leads" ON public.chatbot_leads FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER chatbot_leads_updated_at BEFORE UPDATE ON public.chatbot_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Conversations
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  visitor_id TEXT NOT NULL,
  source_url TEXT,
  user_agent TEXT,
  lead_captured BOOLEAN NOT NULL DEFAULT false,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE TRIGGER chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_chat_conv_user ON public.chat_conversations(user_id, created_at DESC);

-- Messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_chat_msg_conv ON public.chat_messages(conversation_id, created_at);
