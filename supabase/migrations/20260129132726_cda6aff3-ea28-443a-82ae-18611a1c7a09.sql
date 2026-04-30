-- ==============================================
-- MIGRATION 1: Checklist Subitems Table
-- ==============================================

-- Create subitems table for hierarchical checklists
CREATE TABLE public.tarefa_checklist_subitems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_item_id UUID NOT NULL REFERENCES public.tarefa_checklists(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  concluido BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tarefa_checklist_subitems ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow read for authenticated users" 
  ON public.tarefa_checklist_subitems FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" 
  ON public.tarefa_checklist_subitems FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" 
  ON public.tarefa_checklist_subitems FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for authenticated users" 
  ON public.tarefa_checklist_subitems FOR DELETE USING (true);

-- ==============================================
-- MIGRATION 2: Add assigned_users array to tasks
-- ==============================================

-- Add new array column
ALTER TABLE public.projeto_tarefas 
ADD COLUMN IF NOT EXISTS assigned_users TEXT[] DEFAULT '{}';

-- Migrate existing data from assigned_user to assigned_users
UPDATE public.projeto_tarefas 
SET assigned_users = ARRAY[assigned_user] 
WHERE assigned_user IS NOT NULL AND assigned_user != '' AND (assigned_users IS NULL OR assigned_users = '{}');

-- ==============================================
-- MIGRATION 3: Add assigned_users to templates
-- ==============================================

ALTER TABLE public.task_templates
ADD COLUMN IF NOT EXISTS assigned_users_padrao TEXT[] DEFAULT '{}';

-- Migrate existing data
UPDATE public.task_templates 
SET assigned_users_padrao = ARRAY[assigned_user_padrao] 
WHERE assigned_user_padrao IS NOT NULL AND assigned_user_padrao != '' AND (assigned_users_padrao IS NULL OR assigned_users_padrao = '{}');

-- ==============================================
-- MIGRATION 4: Template Checklist Subitems
-- ==============================================

CREATE TABLE public.task_template_checklist_subitems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_checklist_id UUID NOT NULL REFERENCES public.task_template_checklists(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_template_checklist_subitems ENABLE ROW LEVEL SECURITY;

-- RLS Policies  
CREATE POLICY "Allow read for authenticated users" 
  ON public.task_template_checklist_subitems FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users" 
  ON public.task_template_checklist_subitems FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" 
  ON public.task_template_checklist_subitems FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for authenticated users" 
  ON public.task_template_checklist_subitems FOR DELETE USING (true);