-- Criar tabela de tags disponíveis
CREATE TABLE public.tarefa_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Criar tabela de atribuições de tags (N:N)
CREATE TABLE public.tarefa_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tarefa_id UUID NOT NULL REFERENCES public.projeto_tarefas(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tarefa_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tarefa_id, tag_id)
);

-- Adicionar coluna start_date na tabela projeto_tarefas
ALTER TABLE public.projeto_tarefas ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.tarefa_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefa_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tarefa_tags
CREATE POLICY "Allow read for authenticated users" ON public.tarefa_tags FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON public.tarefa_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON public.tarefa_tags FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for authenticated users" ON public.tarefa_tags FOR DELETE USING (true);

-- Políticas RLS para tarefa_tag_assignments
CREATE POLICY "Allow read for authenticated users" ON public.tarefa_tag_assignments FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" ON public.tarefa_tag_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete for authenticated users" ON public.tarefa_tag_assignments FOR DELETE USING (true);

-- Inserir tags padrão
INSERT INTO public.tarefa_tags (name, color) VALUES 
  ('Urgente', '#ef4444'),
  ('Bug', '#f97316'),
  ('Feature', '#3b82f6'),
  ('Melhoria', '#22c55e');