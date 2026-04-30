-- Adicionar 'automation' como tipo válido em notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('mention', 'assignment', 'due_date', 'comment', 'status_change', 'automation'));

-- Adicionar 'custom_board_card' como entity_type válido
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_entity_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_entity_type_check 
  CHECK (entity_type IN ('tarefa', 'projeto', 'cliente', 'custom_board_card'));