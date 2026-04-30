-- Tabela para colunas do board de projetos
CREATE TABLE public.projeto_board_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.projeto_board_columns ENABLE ROW LEVEL SECURITY;

-- RLS policies para projeto_board_columns
CREATE POLICY "Allow read for authenticated users" 
ON public.projeto_board_columns FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow insert for authenticated users" 
ON public.projeto_board_columns FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" 
ON public.projeto_board_columns FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated users" 
ON public.projeto_board_columns FOR DELETE 
TO authenticated
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_projeto_board_columns_updated_at
BEFORE UPDATE ON public.projeto_board_columns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir colunas padrão
INSERT INTO public.projeto_board_columns (name, color, position) VALUES
  ('Backlog', '#6366f1', 0),
  ('Em Progresso', '#f59e0b', 1),
  ('Entrega V1', '#3b82f6', 2),
  ('Voo Solo', '#10b981', 3);

-- Tabela para atividades de projetos
CREATE TABLE public.projeto_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES public.projetos(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projeto_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies para projeto_activities
CREATE POLICY "Users can read activities" 
ON public.projeto_activities FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can insert activities" 
ON public.projeto_activities FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Tabela para comentários de projetos
CREATE TABLE public.projeto_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES public.projetos(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.projeto_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies para projeto_comments
CREATE POLICY "Users can read comments" 
ON public.projeto_comments FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can insert comments" 
ON public.projeto_comments FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own comments" 
ON public.projeto_comments FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
ON public.projeto_comments FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Trigger para updated_at em projeto_comments
CREATE TRIGGER update_projeto_comments_updated_at
BEFORE UPDATE ON public.projeto_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar column_id à tabela projetos
ALTER TABLE public.projetos 
ADD COLUMN IF NOT EXISTS column_id UUID REFERENCES public.projeto_board_columns(id) ON DELETE SET NULL;

-- Adicionar RLS na tabela projetos se não existir
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;

-- RLS policies para projetos
CREATE POLICY "Allow read for authenticated users" 
ON public.projetos FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow insert for authenticated users" 
ON public.projetos FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" 
ON public.projetos FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated users" 
ON public.projetos FOR DELETE 
TO authenticated
USING (true);