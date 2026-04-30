-- Add priority column to projeto_tarefas for task priority levels
ALTER TABLE public.projeto_tarefas 
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';

-- Add a comment explaining the column
COMMENT ON COLUMN public.projeto_tarefas.priority IS 'Task priority level: urgent, high, medium, low';