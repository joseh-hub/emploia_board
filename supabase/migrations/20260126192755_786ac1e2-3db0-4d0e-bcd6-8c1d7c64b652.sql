-- Add description field to projeto_tarefas
ALTER TABLE public.projeto_tarefas 
ADD COLUMN IF NOT EXISTS descricao text;

-- Create table for tarefa comments
CREATE TABLE IF NOT EXISTS public.tarefa_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id uuid NOT NULL REFERENCES public.projeto_tarefas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  mentions text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on tarefa_comments
ALTER TABLE public.tarefa_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for tarefa_comments
CREATE POLICY "Users can read tarefa comments" 
  ON public.tarefa_comments FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Users can insert tarefa comments" 
  ON public.tarefa_comments FOR INSERT 
  TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own tarefa comments" 
  ON public.tarefa_comments FOR UPDATE 
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tarefa comments" 
  ON public.tarefa_comments FOR DELETE 
  TO authenticated USING (auth.uid() = user_id);

-- Create table for tarefa activities
CREATE TABLE IF NOT EXISTS public.tarefa_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id uuid NOT NULL REFERENCES public.projeto_tarefas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  field_name text,
  old_value text,
  new_value text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on tarefa_activities
ALTER TABLE public.tarefa_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for tarefa_activities
CREATE POLICY "Users can read tarefa activities" 
  ON public.tarefa_activities FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Users can insert tarefa activities" 
  ON public.tarefa_activities FOR INSERT 
  TO authenticated WITH CHECK (true);