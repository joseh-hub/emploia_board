-- Add cluster + opcional to template
ALTER TABLE public.cliente_checklist_template
  ADD COLUMN IF NOT EXISTS cluster text NOT NULL DEFAULT 'B',
  ADD COLUMN IF NOT EXISTS opcional boolean NOT NULL DEFAULT false;

ALTER TABLE public.cliente_checklist_template
  DROP CONSTRAINT IF EXISTS cliente_checklist_template_cluster_check;
ALTER TABLE public.cliente_checklist_template
  ADD CONSTRAINT cliente_checklist_template_cluster_check
  CHECK (cluster IN ('B','C','D'));

CREATE INDEX IF NOT EXISTS idx_cliente_checklist_template_cluster_position
  ON public.cliente_checklist_template (cluster, position);

-- Mirror "opcional" on items so the badge survives generation
ALTER TABLE public.cliente_checklist_items
  ADD COLUMN IF NOT EXISTS opcional boolean NOT NULL DEFAULT false;