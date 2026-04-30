-- Criar tabela para colunas do board de tarefas PRIMEIRO
CREATE TABLE IF NOT EXISTS public.tarefa_board_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS policies para tarefa_board_columns
ALTER TABLE public.tarefa_board_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for authenticated users" 
  ON public.tarefa_board_columns FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated users" 
  ON public.tarefa_board_columns FOR INSERT 
  TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" 
  ON public.tarefa_board_columns FOR UPDATE 
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated users" 
  ON public.tarefa_board_columns FOR DELETE 
  TO authenticated USING (true);

-- Inserir colunas padrão
INSERT INTO public.tarefa_board_columns (name, color, position) VALUES
  ('A Fazer', '#6366f1', 0),
  ('Em Progresso', '#f59e0b', 1),
  ('Em Revisão', '#8b5cf6', 2),
  ('Concluído', '#22c55e', 3);

-- Adicionar coluna priorizado na tabela de tarefas
ALTER TABLE public.projeto_tarefas 
ADD COLUMN IF NOT EXISTS priorizado boolean DEFAULT false;

-- Adicionar column_id para suporte ao Kanban
ALTER TABLE public.projeto_tarefas 
ADD COLUMN IF NOT EXISTS column_id uuid REFERENCES public.tarefa_board_columns(id) ON DELETE SET NULL;