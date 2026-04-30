-- Adicionar campos para escopo por board na tabela automations
ALTER TABLE automations ADD COLUMN IF NOT EXISTS board_id UUID REFERENCES custom_boards(id) ON DELETE CASCADE;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'global';

-- Criar tabela de eventos de automação para Database Webhooks
CREATE TABLE IF NOT EXISTS automation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  board_id UUID REFERENCES custom_boards(id) ON DELETE SET NULL,
  card_data JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE automation_events ENABLE ROW LEVEL SECURITY;

-- Policies para automation_events
CREATE POLICY "Authenticated users can insert automation events"
  ON automation_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their events"
  ON automation_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Criar tabela para API Keys de webhook inbound
CREATE TABLE IF NOT EXISTS webhook_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_preview TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS para webhook_api_keys
ALTER TABLE webhook_api_keys ENABLE ROW LEVEL SECURITY;

-- Policies para webhook_api_keys
CREATE POLICY "Users can manage their own API keys"
  ON webhook_api_keys FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_automation_events_processed ON automation_events(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_automation_events_event_type ON automation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_automations_scope ON automations(scope);
CREATE INDEX IF NOT EXISTS idx_automations_board_id ON automations(board_id);
CREATE INDEX IF NOT EXISTS idx_webhook_api_keys_hash ON webhook_api_keys(key_hash);