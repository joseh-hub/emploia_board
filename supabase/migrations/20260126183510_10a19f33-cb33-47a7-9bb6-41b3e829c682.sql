-- Create table for project tasks
CREATE TABLE public.projeto_tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id UUID NOT NULL REFERENCES public.projetos(project_id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  assigned_user TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for task checklists
CREATE TABLE public.tarefa_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tarefa_id UUID NOT NULL REFERENCES public.projeto_tarefas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  concluido BOOLEAN DEFAULT false,
  priorizado BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projeto_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefa_checklists ENABLE ROW LEVEL SECURITY;

-- RLS policies for projeto_tarefas
CREATE POLICY "Allow read for authenticated users" ON public.projeto_tarefas
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON public.projeto_tarefas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON public.projeto_tarefas
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated users" ON public.projeto_tarefas
  FOR DELETE USING (true);

-- RLS policies for tarefa_checklists
CREATE POLICY "Allow read for authenticated users" ON public.tarefa_checklists
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON public.tarefa_checklists
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" ON public.tarefa_checklists
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated users" ON public.tarefa_checklists
  FOR DELETE USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_projeto_tarefas_updated_at
  BEFORE UPDATE ON public.projeto_tarefas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tarefa_checklists_updated_at
  BEFORE UPDATE ON public.tarefa_checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();