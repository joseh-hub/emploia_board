-- Migration: Daily Check-in Feature
-- Adds whatsapp_phone to profiles, creates daily_checkin_config and daily_checkin_user_config tables

-- 1. Adicionar campo de WhatsApp ao perfil do usuário
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;

-- 2. Config global do check-in diário (linha única, shared por todos)
CREATE TABLE IF NOT EXISTS daily_checkin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN DEFAULT true NOT NULL,
  questions JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Inserir config padrão com perguntas iniciais
INSERT INTO daily_checkin_config (questions)
VALUES ('[
  {"id":"q1","text":"Como está o andamento de {card.nome}?"},
  {"id":"q2","text":"Você concluiu algum item do checklist de {card.nome}? ({card.checklist.pendentes} itens pendentes)"},
  {"id":"q3","text":"Tem algo novo para adicionar na descrição de {card.nome}?"},
  {"id":"q4","text":"O prazo de {card.nome} está em {card.dataEntrega}. Ainda está no prazo?"}
]'::jsonb);

-- 3. Config por usuário (horário, colunas selecionadas, ativo/inativo)
CREATE TABLE IF NOT EXISTS daily_checkin_user_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  schedule_time TIME DEFAULT '11:00:00' NOT NULL,
  selected_columns_projetos TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  selected_columns_tarefas TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- 4. RLS Policies

ALTER TABLE daily_checkin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkin_user_config ENABLE ROW LEVEL SECURITY;

-- Config global: todos autenticados podem ver e editar
CREATE POLICY "authenticated users can view checkin config"
  ON daily_checkin_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can update checkin config"
  ON daily_checkin_config FOR UPDATE
  TO authenticated
  USING (true);

-- Config por usuário: todos podem ver (para admin), usuário pode editar a sua
CREATE POLICY "authenticated users can view all user configs"
  ON daily_checkin_user_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can insert user configs"
  ON daily_checkin_user_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated users can update user configs"
  ON daily_checkin_user_config FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can delete user configs"
  ON daily_checkin_user_config FOR DELETE
  TO authenticated
  USING (true);

-- 5. Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_daily_checkin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_checkin_config_updated_at
  BEFORE UPDATE ON daily_checkin_config
  FOR EACH ROW EXECUTE FUNCTION update_daily_checkin_updated_at();

CREATE TRIGGER daily_checkin_user_config_updated_at
  BEFORE UPDATE ON daily_checkin_user_config
  FOR EACH ROW EXECUTE FUNCTION update_daily_checkin_updated_at();

-- NOTA: Para ativar o cron job, habilite as extensões pg_cron e pg_net no
-- Supabase Dashboard (Database > Extensions) e então execute:
--
-- SELECT cron.schedule(
--   'daily-checkin-trigger',
--   '* * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://SEU_PROJECT_REF.supabase.co/functions/v1/send-daily-checkin',
--     headers := '{"Authorization": "Bearer SEU_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   )
--   $$
-- );
--
-- Alternativamente, configure como Scheduled Function no Supabase Dashboard.
