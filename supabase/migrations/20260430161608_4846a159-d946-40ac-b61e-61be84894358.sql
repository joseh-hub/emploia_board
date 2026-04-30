-- Clean previous template (only had a test row)
DELETE FROM public.cliente_checklist_template;

-- =============== CLUSTER B (22 items) ===============
INSERT INTO public.cliente_checklist_template
  (texto, position, dias_offset, cadencia, ocorrencias, categoria, cluster, opcional)
VALUES
  ('Kick-off + alinhamento de metas',                 0,   0, 'unica',     1, 'reuniao',   'B', false),
  ('Reunião Semanal',                                 1,   7, 'semanal',   3, 'reuniao',   'B', false),
  ('Reunião Quinzenal Mês 1',                        2,  15, 'unica',     1, 'reuniao',   'B', false),
  ('Onboarding check + dados mensais',                3,  30, 'unica',     1, 'report',    'B', false),
  ('Reunião Quinzenal Mês 2',                        4,  45, 'quinzenal', 2, 'reuniao',   'B', false),
  ('Checkpoint mensal (dados) Mês 2',                5,  60, 'unica',     1, 'report',    'B', false),
  ('Checkpoint trimestral (dados) Mês 3',            6,  90, 'unica',     1, 'report',    'B', false),
  ('1º QBR — resultados + expansão',                 7,  90, 'unica',     1, 'qbr',       'B', false),
  ('Entregável: Estudo de Nicho (no QBR)',            8,  90, 'unica',     1, 'auditoria', 'B', false),
  ('Reuniões Mês 4-5 (quinzenal)',                    9, 105, 'quinzenal', 4, 'reuniao',   'B', false),
  ('Checkpoint mensal Mês 4',                        10, 120, 'unica',     1, 'report',    'B', false),
  ('Entregável: Estudo de Concorrentes',              11, 120, 'unica',     1, 'auditoria', 'B', false),
  ('Checkpoint trimestral Mês 6',                    12, 180, 'unica',     1, 'report',    'B', false),
  ('2º QBR + midyear review',                         13, 180, 'unica',     1, 'qbr',       'B', false),
  ('Entregável: Roadmap de IA (no QBR)',              14, 180, 'unica',     1, 'auditoria', 'B', true),
  ('Presente: Uísque (se up/cross-sell)',             15, 180, 'unica',     1, 'grow',      'B', true),
  ('Reuniões Mês 7-8 (quinzenal)',                    16, 195, 'quinzenal', 4, 'reuniao',   'B', false),
  ('Checkpoint mensal Mês 7',                        17, 210, 'unica',     1, 'report',    'B', false),
  ('Checkpoint trimestral Mês 9',                    18, 270, 'unica',     1, 'report',    'B', false),
  ('3º QBR — preparar terreno p/ aniversário',        19, 270, 'unica',     1, 'qbr',       'B', false),
  ('AI Assessment (se contratado)',                   20, 270, 'unica',     1, 'auditoria', 'B', true),
  ('Reuniões Mês 10-11 (quinzenal)',                  21, 285, 'quinzenal', 4, 'reuniao',   'B', false),
  ('Checkpoint mensal Mês 10',                        22, 300, 'unica',     1, 'report',    'B', false),
  ('Planejamento do aniversário (presente + CX)',     23, 330, 'unica',     1, 'grow',      'B', false),
  ('Checkpoint trimestral Mês 12',                   24, 360, 'unica',     1, 'report',    'B', false),
  ('4º QBR + Aniversário',                            25, 360, 'unica',     1, 'qbr',       'B', false);

-- =============== CLUSTER C (17 items) ===============
INSERT INTO public.cliente_checklist_template
  (texto, position, dias_offset, cadencia, ocorrencias, categoria, cluster, opcional)
VALUES
  ('Kick-off + alinhamento de metas',                 0,   0, 'unica',     1, 'reuniao',   'C', false),
  ('Reunião Semanal',                                 1,   7, 'semanal',   2, 'reuniao',   'C', false),
  ('Reunião Quinzenal Mês 1',                        2,  15, 'unica',     1, 'reuniao',   'C', false),
  ('Onboarding check + dados mensais',                3,  30, 'unica',     1, 'report',    'C', false),
  ('Reunião Mensal Mês 2',                           4,  60, 'unica',     1, 'reuniao',   'C', false),
  ('Checkpoint mensal Mês 2',                        5,  60, 'unica',     1, 'report',    'C', false),
  ('Checkpoint trimestral Mês 3',                    6,  90, 'unica',     1, 'report',    'C', false),
  ('1º QBR — resultados + saúde',                    7,  90, 'unica',     1, 'qbr',       'C', false),
  ('Entregável: Estudo de Nicho (no QBR)',            8,  90, 'unica',     1, 'auditoria', 'C', false),
  ('Reuniões Mês 4-5 (quinzenal)',                    9, 105, 'quinzenal', 4, 'reuniao',   'C', false),
  ('Checkpoint mensal Mês 4',                        10, 120, 'unica',     1, 'report',    'C', false),
  ('Entregável: Estudo de Concorrentes',              11, 120, 'unica',     1, 'auditoria', 'C', false),
  ('Checkpoint trimestral Mês 6',                    12, 180, 'unica',     1, 'report',    'C', false),
  ('2º QBR — saúde do contrato',                     13, 180, 'unica',     1, 'qbr',       'C', false),
  ('Entregável: Roadmap de IA (no QBR)',              14, 180, 'unica',     1, 'auditoria', 'C', true),
  ('Reunião Mensal Mês 7-8',                         15, 210, 'mensal',    2, 'reuniao',   'C', false),
  ('Checkpoint mensal Mês 7',                        16, 210, 'unica',     1, 'report',    'C', false),
  ('Checkpoint trimestral Mês 9',                    17, 270, 'unica',     1, 'report',    'C', false),
  ('3º QBR — saúde do contrato',                     18, 270, 'unica',     1, 'qbr',       'C', false),
  ('AI Assessment (se contratado)',                   19, 270, 'unica',     1, 'auditoria', 'C', true),
  ('Reunião Mensal Mês 10-11',                       20, 300, 'mensal',    2, 'reuniao',   'C', false),
  ('Checkpoint mensal Mês 10',                        21, 300, 'unica',     1, 'report',    'C', false),
  ('Checkpoint trimestral Mês 12',                   22, 360, 'unica',     1, 'report',    'C', false),
  ('4º QBR + Aniversário',                            23, 360, 'unica',     1, 'qbr',       'C', false);

-- =============== CLUSTER D (7 items) ===============
INSERT INTO public.cliente_checklist_template
  (texto, position, dias_offset, cadencia, ocorrencias, categoria, cluster, opcional)
VALUES
  ('Kick-off',                                        0,   0, 'unica', 1, 'reuniao',   'D', false),
  ('Relatório assíncrono inicial (B/C/D)',            1,  30, 'unica', 1, 'report',    'D', false),
  ('Checkpoint trimestral Mês 3',                    2,  90, 'unica', 1, 'report',    'D', false),
  ('1º QBR — PDF/Loom enviado',                       3,  90, 'unica', 1, 'qbr',       'D', false),
  ('Checkpoint trimestral Mês 6',                    4, 180, 'unica', 1, 'report',    'D', false),
  ('2º QBR — PDF/Loom enviado',                       5, 180, 'unica', 1, 'qbr',       'D', false),
  ('Roadmap de IA — versão simplificada',             6, 180, 'unica', 1, 'auditoria', 'D', true),
  ('Checkpoint trimestral Mês 9',                    7, 270, 'unica', 1, 'report',    'D', false),
  ('3º QBR — PDF/Loom enviado',                       8, 270, 'unica', 1, 'qbr',       'D', false),
  ('AI Assessment (se contratado)',                   9, 270, 'unica', 1, 'auditoria', 'D', true),
  ('Checkpoint trimestral Mês 12',                  10, 360, 'unica', 1, 'report',    'D', false),
  ('4º QBR — PDF/Loom enviado',                      11, 360, 'unica', 1, 'qbr',       'D', false);