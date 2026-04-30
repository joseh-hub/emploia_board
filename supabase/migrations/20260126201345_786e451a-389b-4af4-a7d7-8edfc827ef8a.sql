-- =====================================================
-- FASE 1: Alterações em tabelas existentes
-- =====================================================

-- Adicionar campos para ordenação (position) e hierarquia em tarefas
ALTER TABLE projeto_tarefas 
  ADD COLUMN IF NOT EXISTS position integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS due_date timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_date timestamptz,
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES projeto_tarefas(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS depth integer DEFAULT 0;

-- Adicionar position em projetos
ALTER TABLE projetos 
  ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;

-- Adicionar position em clientes
ALTER TABLE metadata_clientes 
  ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;

-- Índice para performance em subtarefas
CREATE INDEX IF NOT EXISTS idx_tarefas_parent ON projeto_tarefas(parent_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_due_date ON projeto_tarefas(due_date);

-- =====================================================
-- FASE 2: Tabela de Notificações
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('mention', 'assignment', 'due_date', 'comment', 'status_change')),
  title text NOT NULL,
  message text,
  entity_type text CHECK (entity_type IN ('tarefa', 'projeto', 'cliente')),
  entity_id text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- FASE 3: Time Tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tarefa_id uuid REFERENCES projeto_tarefas(id) ON DELETE SET NULL,
  projeto_id uuid REFERENCES projetos(project_id) ON DELETE SET NULL,
  cliente_id integer REFERENCES metadata_clientes(id) ON DELETE SET NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration_minutes integer,
  billable boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time entries" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time entries" ON time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own time entries" ON time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FASE 4: Automações
-- =====================================================

CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN ('status_change', 'due_date', 'assignment', 'created', 'completed')),
  trigger_config jsonb DEFAULT '{}',
  action_type text NOT NULL CHECK (action_type IN ('webhook', 'notification', 'move_column', 'assign', 'update_field')),
  action_config jsonb DEFAULT '{}',
  entity_type text NOT NULL CHECK (entity_type IN ('tarefa', 'projeto', 'cliente')),
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view automations" ON automations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create automations" ON automations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own automations" ON automations
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own automations" ON automations
  FOR DELETE USING (auth.uid() = created_by);

CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid REFERENCES automations(id) ON DELETE CASCADE,
  trigger_data jsonb,
  action_result jsonb,
  status text CHECK (status IN ('success', 'failed', 'pending')),
  error_message text,
  executed_at timestamptz DEFAULT now()
);

ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view automation logs" ON automation_logs
  FOR SELECT USING (true);

CREATE POLICY "System can insert automation logs" ON automation_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- FASE 5: Templates de Tarefas
-- =====================================================

CREATE TABLE IF NOT EXISTS task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  titulo_padrao text NOT NULL,
  descricao_padrao text,
  assigned_user_padrao text,
  projeto_id uuid REFERENCES projetos(project_id) ON DELETE SET NULL,
  is_global boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view templates" ON task_templates
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create templates" ON task_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" ON task_templates
  FOR UPDATE USING (auth.uid() = created_by OR is_global = true);

CREATE POLICY "Users can delete own templates" ON task_templates
  FOR DELETE USING (auth.uid() = created_by);

CREATE TABLE IF NOT EXISTS task_template_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
  texto text NOT NULL,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE task_template_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view template checklists" ON task_template_checklists
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage template checklists" ON task_template_checklists
  FOR ALL USING (true);

-- =====================================================
-- FASE 6: Dependências entre Tarefas
-- =====================================================

CREATE TABLE IF NOT EXISTS task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id uuid NOT NULL REFERENCES projeto_tarefas(id) ON DELETE CASCADE,
  depends_on_id uuid NOT NULL REFERENCES projeto_tarefas(id) ON DELETE CASCADE,
  dependency_type text DEFAULT 'blocks' CHECK (dependency_type IN ('blocks', 'blocked_by', 'relates_to')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tarefa_id, depends_on_id)
);

ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dependencies" ON task_dependencies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create dependencies" ON task_dependencies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dependencies" ON task_dependencies
  FOR DELETE USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_tarefa ON time_entries(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_tarefa ON task_dependencies(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends ON task_dependencies(depends_on_id);