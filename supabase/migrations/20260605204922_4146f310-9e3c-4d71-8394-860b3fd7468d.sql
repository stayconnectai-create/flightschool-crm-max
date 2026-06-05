
ALTER TABLE public.school_settings
  ADD COLUMN IF NOT EXISTS suggested_questions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS booking_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS programs text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status_label text NOT NULL DEFAULT 'Online — typically replies in a few minutes';

ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS needs_human boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS handoff_at timestamptz;

ALTER TABLE public.chatbot_leads
  ADD COLUMN IF NOT EXISTS lead_type text NOT NULL DEFAULT 'inquiry',
  ADD COLUMN IF NOT EXISTS preferred_date text,
  ADD COLUMN IF NOT EXISTS program text;
