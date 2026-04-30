-- Create table for client activities
CREATE TABLE public.cliente_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES public.metadata_clientes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cliente_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read activities" 
ON public.cliente_activities 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert activities" 
ON public.cliente_activities 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_cliente_activities_cliente_id ON public.cliente_activities(cliente_id);
CREATE INDEX idx_cliente_activities_created_at ON public.cliente_activities(created_at DESC);