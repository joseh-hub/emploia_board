-- Retroactive linkage: set template_id on existing tasks matching default template names
UPDATE projeto_tarefas pt
SET template_id = tt.id
FROM task_templates tt
WHERE pt.titulo = tt.name
  AND tt.is_default = true
  AND pt.template_id IS NULL;