
-- Table: projetos_overview
CREATE TABLE public.projetos_overview (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id uuid NOT NULL,
  projeto_id uuid NOT NULL,
  cliente_name text,
  projeto_name text,
  checklist_name text,
  due_date timestamptz,
  status text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT projetos_overview_tarefa_id_key UNIQUE (tarefa_id)
);

-- RLS
ALTER TABLE public.projetos_overview ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select projetos_overview"
  ON public.projetos_overview FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert projetos_overview"
  ON public.projetos_overview FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update projetos_overview"
  ON public.projetos_overview FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projetos_overview"
  ON public.projetos_overview FOR DELETE TO authenticated USING (true);
