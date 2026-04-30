
-- ========================================
-- Bolixe IA Conversacional: done em tudo até Acompanhamento
-- Tarefas: Desenvolvimento, Teste Interno, Teste Externo, Produção → concluido
-- ========================================

-- Marcar tarefas como concluídas
UPDATE projeto_tarefas SET status = 'concluido', column_id = '1227c3bc-dec4-4c33-9614-33303c7263ae'
WHERE id IN (
  '4a17e309-d093-41ee-a438-5f5a2b2f0a52',  -- Desenvolvimento
  '4f293fc7-d3e3-440a-bd89-7f3ac5363ae0',  -- Teste Interno
  'ea47909d-cbff-4d27-a216-4034cc931101',  -- Teste Externo
  'e45f715c-93ca-41d6-aa48-526e28d5000a'   -- Produção
);

-- Marcar todos os checklists dessas tarefas como concluídos
UPDATE tarefa_checklists SET concluido = true, completed_at = now()
WHERE tarefa_id IN (
  '4a17e309-d093-41ee-a438-5f5a2b2f0a52',
  '4f293fc7-d3e3-440a-bd89-7f3ac5363ae0',
  'ea47909d-cbff-4d27-a216-4034cc931101',
  'e45f715c-93ca-41d6-aa48-526e28d5000a'
);

-- ========================================
-- Bolixe Plataforma de Vendas: done no Alinhamento Interno
-- ========================================

-- Marcar tarefa Alinhamento Interno como concluída
UPDATE projeto_tarefas SET status = 'concluido', column_id = '1227c3bc-dec4-4c33-9614-33303c7263ae'
WHERE id = '5c3dd17f-ddf6-4ef6-8955-54a5e548c298';

-- Marcar todos os checklists do Alinhamento Interno como concluídos
UPDATE tarefa_checklists SET concluido = true, completed_at = now()
WHERE tarefa_id = '5c3dd17f-ddf6-4ef6-8955-54a5e548c298';
