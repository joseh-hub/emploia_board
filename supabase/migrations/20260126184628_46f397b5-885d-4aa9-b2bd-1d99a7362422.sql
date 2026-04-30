-- Drop the invalid trigger that references non-existent column
DROP TRIGGER IF EXISTS update_tarefa_checklists_updated_at ON public.tarefa_checklists;