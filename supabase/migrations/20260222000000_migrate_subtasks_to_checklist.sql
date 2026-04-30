-- Migração: subtarefas (projeto_tarefas.parent_id) → itens de checklist (tarefa_checklists)
-- Comportamento: subtarefas de primeiro nível viram itens do checklist da tarefa pai.
-- Se existirem subtarefas em múltiplos níveis (árvore), apenas o nível direto (parent_id NOT NULL)
-- é migrado; cada uma vira um item no checklist do pai direto (achatamento para um nível).

-- 1) Inserir itens em tarefa_checklists a partir das subtarefas, com position após o último item existente
INSERT INTO public.tarefa_checklists (id, tarefa_id, texto, concluido, position, created_at)
SELECT
  gen_random_uuid(),
  st.parent_id,
  st.titulo,
  (st.status = 'concluido'),
  COALESCE(base.max_pos, 0) + row_number() OVER (PARTITION BY st.parent_id ORDER BY COALESCE(st.position, 0), st.created_at),
  now()
FROM public.projeto_tarefas st
LEFT JOIN LATERAL (
  SELECT COALESCE(MAX(tc.position), 0) AS max_pos
  FROM public.tarefa_checklists tc
  WHERE tc.tarefa_id = st.parent_id
) base ON true
WHERE st.parent_id IS NOT NULL;

-- 2) Remover as subtarefas migradas de projeto_tarefas
DELETE FROM public.projeto_tarefas
WHERE parent_id IS NOT NULL;
