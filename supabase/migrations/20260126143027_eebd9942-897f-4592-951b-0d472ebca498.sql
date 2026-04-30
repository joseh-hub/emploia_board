-- Create board_columns table for customizable Kanban columns
CREATE TABLE public.board_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.board_columns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for board_columns
CREATE POLICY "Allow read for authenticated users"
  ON public.board_columns FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON public.board_columns FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users"
  ON public.board_columns FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated users"
  ON public.board_columns FOR DELETE
  TO authenticated USING (true);

-- Add column_id to metadata_clientes
ALTER TABLE public.metadata_clientes
  ADD COLUMN column_id UUID REFERENCES public.board_columns(id) ON DELETE SET NULL;

-- Add INSERT policy to metadata_clientes (currently blocked)
CREATE POLICY "Allow insert for authenticated users"
  ON public.metadata_clientes FOR INSERT
  TO authenticated WITH CHECK (true);

-- Add DELETE policy to metadata_clientes (currently blocked)
CREATE POLICY "Allow delete for authenticated users"
  ON public.metadata_clientes FOR DELETE
  TO authenticated USING (true);

-- Create trigger for updated_at on board_columns
CREATE TRIGGER update_board_columns_updated_at
  BEFORE UPDATE ON public.board_columns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default columns based on ClickUp style
INSERT INTO public.board_columns (name, color, position) VALUES
  ('MELHORIAS', '#22c55e', 0),
  ('MÉTRICAS', '#eab308', 1),
  ('FINAL ONBOARDING', '#3b82f6', 2),
  ('CHURN', '#f97316', 3),
  ('CONCLUÍDO', '#22c55e', 4);