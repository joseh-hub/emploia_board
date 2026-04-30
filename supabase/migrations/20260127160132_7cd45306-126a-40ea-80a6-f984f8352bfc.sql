
-- Insert client folders for all existing clients
INSERT INTO wiki_folders (name, parent_id, folder_type, entity_id, entity_type)
SELECT 
  mc.name,
  (SELECT id FROM wiki_folders WHERE folder_type = 'clients' LIMIT 1),
  'client',
  mc.id::TEXT,
  'cliente'
FROM metadata_clientes mc
WHERE mc.name IS NOT NULL
ON CONFLICT DO NOTHING;

-- Insert 'Projetos' subfolders for each client folder
INSERT INTO wiki_folders (name, parent_id, folder_type, entity_id, entity_type)
SELECT 
  'Projetos',
  wf.id,
  'project',
  wf.entity_id,
  'cliente'
FROM wiki_folders wf
WHERE wf.folder_type = 'client' AND wf.entity_type = 'cliente'
ON CONFLICT DO NOTHING;

-- Insert project folders inside client's Projetos folder
INSERT INTO wiki_folders (name, parent_id, folder_type, entity_id, entity_type)
SELECT 
  p.company_name,
  pf.id,
  'project',
  p.project_id::TEXT,
  'projeto'
FROM projetos p
JOIN wiki_folders cf ON cf.entity_id = p.id_cliente::TEXT AND cf.folder_type = 'client' AND cf.entity_type = 'cliente'
JOIN wiki_folders pf ON pf.parent_id = cf.id AND pf.name = 'Projetos'
WHERE p.company_name IS NOT NULL AND p.id_cliente IS NOT NULL
ON CONFLICT DO NOTHING;

-- Insert 'Tarefas' subfolder for each project folder
INSERT INTO wiki_folders (name, parent_id, folder_type, entity_id, entity_type)
SELECT 
  'Tarefas',
  wf.id,
  'tasks',
  wf.entity_id,
  'projeto'
FROM wiki_folders wf
WHERE wf.folder_type = 'project' AND wf.entity_type = 'projeto'
ON CONFLICT DO NOTHING;
