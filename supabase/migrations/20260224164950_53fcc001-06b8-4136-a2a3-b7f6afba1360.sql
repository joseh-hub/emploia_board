-- Preencher due_date retroativamente para tarefas existentes
-- Calcula: due_date = projeto.created_at + template.due_days_offset dias
UPDATE projeto_tarefas pt
SET due_date = p.created_at + (tt.due_days_offset * INTERVAL '1 day')
FROM projetos p, task_templates tt
WHERE pt.projeto_id = p.project_id
  AND pt.template_id = tt.id
  AND tt.due_days_offset IS NOT NULL
  AND pt.due_date IS NULL;