-- Tabela de anexos de tarefa + bucket privado + políticas
-- Delete: qualquer usuário autenticado pode excluir (conforme especificação).

-- 1) Tabela de metadados dos anexos
CREATE TABLE public.tarefa_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES public.projeto_tarefas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'other',
  storage_path TEXT NOT NULL,
  size_bytes INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_tarefa_attachments_tarefa ON public.tarefa_attachments(tarefa_id);

ALTER TABLE public.tarefa_attachments ENABLE ROW LEVEL SECURITY;

-- RLS: qualquer autenticado pode SELECT, INSERT e DELETE
CREATE POLICY "Authenticated users can view task attachments"
  ON public.tarefa_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create task attachments"
  ON public.tarefa_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete task attachments"
  ON public.tarefa_attachments FOR DELETE
  TO authenticated
  USING (true);

-- 2) Bucket privado para anexos de tarefa
INSERT INTO storage.buckets (id, name, public)
VALUES ('tarefa-attachments', 'tarefa-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- 3) Políticas de storage: authenticated pode INSERT, SELECT e DELETE
CREATE POLICY "Authenticated users can upload task attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tarefa-attachments');

CREATE POLICY "Authenticated users can view task attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'tarefa-attachments');

CREATE POLICY "Authenticated users can delete task attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'tarefa-attachments');
