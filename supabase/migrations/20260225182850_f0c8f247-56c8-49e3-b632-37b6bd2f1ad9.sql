
-- Marcar tarefas da Cellairis como done
UPDATE projeto_tarefas SET status = 'concluido', column_id = '1227c3bc-dec4-4c33-9614-33303c7263ae'
WHERE id IN ('2a434f88-0d14-4915-9d8e-84d422b1b0f0', '7a607734-2390-404c-a2f4-c7d48e1b9472', '92ec31ec-c498-4069-bbd0-55f13b11c78f');

-- Mover Bolixe IA Conversacional para Métricas (não existe coluna Acompanhamento - usando Métricas como mais próximo)
-- NOTA: Coluna "Acompanhamento" não existe no board de projetos.
-- Colunas disponíveis: Onboarding, Desenvolvimento, Produção, Métricas, Voo Solo, Grow, Churn, Projetos
