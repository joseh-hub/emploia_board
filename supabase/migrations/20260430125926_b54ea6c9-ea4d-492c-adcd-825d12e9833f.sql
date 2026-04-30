-- Tabela de itens de checklist por cliente
CREATE TABLE public.cliente_checklist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id bigint NOT NULL,
  texto text NOT NULL,
  concluido boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  completed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cliente_checklist_items_cliente_id ON public.cliente_checklist_items(cliente_id);
CREATE INDEX idx_cliente_checklist_items_position ON public.cliente_checklist_items(cliente_id, position);

ALTER TABLE public.cliente_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select checklist items"
  ON public.cliente_checklist_items FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated can insert checklist items"
  ON public.cliente_checklist_items FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update checklist items"
  ON public.cliente_checklist_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete checklist items"
  ON public.cliente_checklist_items FOR DELETE
  TO authenticated USING (true);

CREATE TRIGGER trg_cliente_checklist_items_updated_at
  BEFORE UPDATE ON public.cliente_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de template padrão de checklist
CREATE TABLE public.cliente_checklist_template (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  texto text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cliente_checklist_template_position ON public.cliente_checklist_template(position);

ALTER TABLE public.cliente_checklist_template ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage checklist template"
  ON public.cliente_checklist_template FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER trg_cliente_checklist_template_updated_at
  BEFORE UPDATE ON public.cliente_checklist_template
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();