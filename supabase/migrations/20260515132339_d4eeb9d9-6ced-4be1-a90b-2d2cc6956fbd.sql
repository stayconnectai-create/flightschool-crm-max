-- Aircraft status enum
CREATE TYPE public.aircraft_status AS ENUM ('in_flight', 'grounded', 'reserved', 'maintenance');

-- Aircraft table
CREATE TABLE public.aircraft (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tail_number TEXT NOT NULL,
  icao24 TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT,
  year INT,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  hobbs_hours NUMERIC(10,1) NOT NULL DEFAULT 0,
  next_maintenance_hours NUMERIC(10,1) NOT NULL DEFAULT 0,
  based_at TEXT,
  pilot TEXT,
  status public.aircraft_status NOT NULL DEFAULT 'grounded',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  altitude INT DEFAULT 0,
  speed INT DEFAULT 0,
  heading INT DEFAULT 0,
  squawk TEXT,
  origin TEXT,
  destination TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_aircraft_user_id ON public.aircraft(user_id);

ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own aircraft" ON public.aircraft
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own aircraft" ON public.aircraft
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own aircraft" ON public.aircraft
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own aircraft" ON public.aircraft
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_aircraft_updated_at
  BEFORE UPDATE ON public.aircraft
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();