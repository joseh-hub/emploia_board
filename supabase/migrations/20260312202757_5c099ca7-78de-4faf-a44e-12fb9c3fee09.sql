CREATE TABLE comunicacoes_sugeridas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id BIGINT,
  projeto_id UUID,
  group_id TEXT,
  mensagem_sugerida TEXT NOT NULL,
  mensagem_final TEXT,
  motivo TEXT,
  tipo_comunicacao TEXT DEFAULT 'check_in',
  contexto JSONB,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

ALTER TABLE comunicacoes_sugeridas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select comunicacoes" ON comunicacoes_sugeridas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert comunicacoes" ON comunicacoes_sugeridas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update comunicacoes" ON comunicacoes_sugeridas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Service role can insert comunicacoes" ON comunicacoes_sugeridas FOR INSERT TO service_role WITH CHECK (true);