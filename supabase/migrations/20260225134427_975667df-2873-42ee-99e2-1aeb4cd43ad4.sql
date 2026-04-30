
-- 1. Projetos em "Voo solo" — concluir templates 1 a 10
UPDATE projeto_tarefas
SET status = 'concluido'
WHERE projeto_id IN (
  'db271e4c-394a-48c2-9c22-53e4f083f167',
  '4f8c2a1f-9104-42e1-8deb-aa19289b091b',
  '674b8175-1067-4148-b4a6-6cbd67f46abf',
  '4f7631e0-9092-406a-aa19-e01f336b3915',
  '4199fe8b-7606-4749-84fd-333f6f93a441',
  '4b8c86f0-0a30-4986-b1f2-27d9708dac39',
  'ef10752b-17e0-4dc6-bd30-ac360e4f0e4c',
  '074a2a08-fe39-4054-aeb0-c119dc25cfbd',
  '8c327ab3-4505-4127-8130-72f323ee4fc5',
  '7a912511-ee29-475a-8103-616e71e7e10a',
  '92bbe126-fb66-4b92-8e58-b6defcd157f6',
  'bb1adfbb-d328-408a-bdfd-f17d3594bfab',
  '1964975b-03ac-42f0-84a3-1e0fa57ea3d3',
  '4227bc29-b83c-4ec6-8fad-3eb70ec462cd',
  'a79f948f-965a-4ff7-af75-afd91582266a',
  '4f78585d-a4f1-439b-8b3e-a175aa6a539e'
)
AND template_id IN (
  'f8cf052b-a5d2-4847-aa9d-ca3a64d2fc04',
  '5dffa25a-3947-44b6-8018-4a60f9c037ad',
  '14a842ef-9e89-4d86-9652-8c4d45751634',
  '1cd71c64-2eb9-4e85-91d5-a90f07be7883',
  '97056090-e4dc-4a12-9bbd-137dc93e22f6',
  'f72474cf-9d40-4e6f-854e-6a2584dceac5',
  '00d15dfb-4db0-4dd1-adf4-8290967c7cb7',
  'b42e8a4a-9a0c-47e4-8efc-bd521c2f1b90',
  '693fb67e-3498-4f1d-ab85-bb043d4639d3',
  '5fa1361c-7fe1-4ed7-b2b5-0469c71cbc81'
)
AND status != 'concluido';

-- 2. Projetos em "Acompanhamento" — concluir templates 1 a 8
UPDATE projeto_tarefas
SET status = 'concluido'
WHERE projeto_id IN (
  '74317f75-bede-4945-8ff6-1c56ead59f6b',
  'c97b8fef-d232-4c01-91cd-4a1386b3fb7e',
  '01076ebd-b7d3-4151-9687-43f50836fec6',
  '896914e7-4512-477c-9c5c-72805743f59a',
  '922d4458-a3e6-4c17-ba4d-aa999e70d25d',
  '534da901-b461-435f-9795-a46587cd5444'
)
AND template_id IN (
  'f8cf052b-a5d2-4847-aa9d-ca3a64d2fc04',
  '5dffa25a-3947-44b6-8018-4a60f9c037ad',
  '14a842ef-9e89-4d86-9652-8c4d45751634',
  '1cd71c64-2eb9-4e85-91d5-a90f07be7883',
  '97056090-e4dc-4a12-9bbd-137dc93e22f6',
  'f72474cf-9d40-4e6f-854e-6a2584dceac5',
  '00d15dfb-4db0-4dd1-adf4-8290967c7cb7',
  'b42e8a4a-9a0c-47e4-8efc-bd521c2f1b90'
)
AND status != 'concluido';

-- 3. Projetos em "Desenvolvimento" — concluir templates 1 a 3
UPDATE projeto_tarefas
SET status = 'concluido'
WHERE projeto_id IN (
  '52a8ec2d-4809-451a-a091-bc80f93a819d',
  '4602ea67-2c93-4b48-9725-1b2cf716b84e',
  '6ca9c2c9-72d2-4c8c-865d-cbe4c4032585',
  'd7b917d3-debd-4a5c-8288-930a1a3be26c'
)
AND template_id IN (
  'f8cf052b-a5d2-4847-aa9d-ca3a64d2fc04',
  '5dffa25a-3947-44b6-8018-4a60f9c037ad',
  '14a842ef-9e89-4d86-9652-8c4d45751634'
)
AND status != 'concluido';
