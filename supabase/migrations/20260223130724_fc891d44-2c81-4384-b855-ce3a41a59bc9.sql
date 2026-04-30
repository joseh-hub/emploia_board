
CREATE TABLE public.tarefa_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES public.projeto_tarefas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'other',
  storage_path TEXT NOT NULL,
  size_bytes BIGINT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tarefa_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage tarefa attachments"
  ON public.tarefa_attachments FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
  VALUES ('tarefa-attachments', 'tarefa-attachments', false);

CREATE POLICY "Auth users upload tarefa attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tarefa-attachments');

CREATE POLICY "Auth users view tarefa attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'tarefa-attachments');

CREATE POLICY "Auth users delete tarefa attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tarefa-attachments');
