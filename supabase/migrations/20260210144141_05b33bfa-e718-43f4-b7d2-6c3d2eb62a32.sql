
-- Add completion message fields to task_templates
ALTER TABLE public.task_templates 
ADD COLUMN IF NOT EXISTS send_message_on_complete BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS completion_message TEXT;

-- Add template tracking and message sent fields to projeto_tarefas
ALTER TABLE public.projeto_tarefas
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS message_sent BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS message_sent_at TIMESTAMPTZ;
