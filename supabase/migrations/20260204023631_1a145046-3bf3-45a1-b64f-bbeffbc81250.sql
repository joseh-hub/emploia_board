-- Remover constraint antiga
ALTER TABLE automations DROP CONSTRAINT IF EXISTS automations_trigger_type_check;

-- Criar constraint atualizada com card_done
ALTER TABLE automations ADD CONSTRAINT automations_trigger_type_check 
  CHECK (trigger_type IN (
    'status_change', 
    'due_date', 
    'assignment', 
    'created', 
    'completed', 
    'card_done'
  ));