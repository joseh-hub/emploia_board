ALTER TABLE public.cliente_checklist_template
  ADD COLUMN IF NOT EXISTS dias_offset INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cadencia TEXT NOT NULL DEFAULT 'unica',
  ADD COLUMN IF NOT EXISTS ocorrencias INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'outro';

ALTER TABLE public.cliente_checklist_template
  ADD CONSTRAINT cliente_checklist_template_cadencia_check
    CHECK (cadencia IN ('unica','semanal','quinzenal','mensal','trimestral')),
  ADD CONSTRAINT cliente_checklist_template_categoria_check
    CHECK (categoria IN ('reuniao','qbr','report','auditoria','grow','outro'));

ALTER TABLE public.cliente_checklist_items
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS nota TEXT,
  ADD COLUMN IF NOT EXISTS executado_em DATE,
  ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'outro';

ALTER TABLE public.cliente_checklist_items
  ADD CONSTRAINT cliente_checklist_items_categoria_check
    CHECK (categoria IN ('reuniao','qbr','report','auditoria','grow','outro'));

CREATE INDEX IF NOT EXISTS idx_cliente_checklist_items_due_date
  ON public.cliente_checklist_items(cliente_id, due_date);