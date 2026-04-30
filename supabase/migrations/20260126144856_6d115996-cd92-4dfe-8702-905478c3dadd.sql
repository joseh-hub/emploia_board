-- Add description column to metadata_clientes
ALTER TABLE public.metadata_clientes
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Create cliente_comments table
CREATE TABLE public.cliente_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id BIGINT NOT NULL REFERENCES public.metadata_clientes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cliente_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read comments" 
  ON public.cliente_comments FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Users can insert comments" 
  ON public.cliente_comments FOR INSERT 
  TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own comments" 
  ON public.cliente_comments FOR UPDATE 
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
  ON public.cliente_comments FOR DELETE 
  TO authenticated USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_cliente_comments_updated_at
  BEFORE UPDATE ON public.cliente_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();