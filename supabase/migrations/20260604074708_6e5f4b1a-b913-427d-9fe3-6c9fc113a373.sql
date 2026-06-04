ALTER TABLE public.school_settings ADD COLUMN IF NOT EXISTS proactive_message TEXT NOT NULL DEFAULT '';
ALTER TABLE public.school_settings ADD COLUMN IF NOT EXISTS proactive_delay INTEGER NOT NULL DEFAULT 10;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_settings TO authenticated;
GRANT ALL ON public.school_settings TO service_role;