-- Parte 1: Adicionar novas colunas à tabela tarefa_checklists
ALTER TABLE public.tarefa_checklists 
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS completed_by uuid;

-- Parte 2: Atualizar a função create_task_wiki_file para incluir checklist
CREATE OR REPLACE FUNCTION public.create_task_wiki_file()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  tasks_folder_id UUID;
  project_name TEXT;
  assigned_user_name TEXT;
  priority_label TEXT;
  file_name TEXT;
  file_content TEXT;
BEGIN
  -- Find the Tarefas folder for this project
  SELECT id INTO tasks_folder_id 
  FROM wiki_folders 
  WHERE folder_type = 'tasks' 
    AND entity_type = 'projeto' 
    AND entity_id = NEW.projeto_id::TEXT
  LIMIT 1;
  
  -- Get project name
  SELECT company_name INTO project_name FROM projetos WHERE project_id = NEW.projeto_id;
  
  -- Get assigned user name
  IF NEW.assigned_user IS NOT NULL THEN
    SELECT COALESCE(full_name, email) INTO assigned_user_name 
    FROM profiles WHERE id::text = NEW.assigned_user;
  END IF;
  
  -- Map priority to label
  priority_label := CASE NEW.priority
    WHEN 'urgent' THEN '🔴 Urgente'
    WHEN 'high' THEN '🟠 Alta'
    WHEN 'medium' THEN '🔵 Média'
    WHEN 'low' THEN '🟢 Baixa'
    ELSE '🔵 Média'
  END;
  
  IF tasks_folder_id IS NOT NULL THEN
    -- Generate file name
    file_name := slugify(NEW.titulo) || '-' || to_char(NEW.created_at, 'YYYY-MM-DD') || '.md';
    
    -- Generate initial content with improved format
    file_content := '# ' || NEW.titulo || E'\n\n' ||
      '## Informações Gerais' || E'\n\n' ||
      '| Campo | Valor |' || E'\n' ||
      '|-------|-------|' || E'\n' ||
      '| **Data de Criação** | ' || to_char(NEW.created_at, 'DD/MM/YYYY HH24:MI') || ' |' || E'\n' ||
      '| **Projeto** | ' || COALESCE(project_name, 'N/A') || ' |' || E'\n' ||
      '| **Responsável** | ' || COALESCE(assigned_user_name, 'Não atribuído') || ' |' || E'\n' ||
      '| **Prioridade** | ' || priority_label || ' |' || E'\n' ||
      '| **Status** | ' || COALESCE(NEW.status, 'pendente') || ' |' || E'\n\n' ||
      '---' || E'\n\n' ||
      '## Checklist de Progresso' || E'\n\n' ||
      '| ✓ | Item | Concluído em | Por |' || E'\n' ||
      '|---|------|--------------|-----|' || E'\n' ||
      '| | _Nenhum item de checklist_ | - | - |' || E'\n\n' ||
      '**Progresso**: 0/0 (0%)' || E'\n\n' ||
      '---' || E'\n\n' ||
      '## Histórico de Atividades' || E'\n\n' ||
      '### ' || to_char(NEW.created_at, 'DD/MM/YYYY HH24:MI') || ' - Criação' || E'\n' ||
      'Tarefa criada.' || E'\n\n' ||
      '---' || E'\n\n' ||
      '## Comentários' || E'\n\n' ||
      '_Nenhum comentário ainda_' || E'\n\n' ||
      '---' || E'\n\n' ||
      '## Notas Manuais' || E'\n\n' ||
      '_Adicione suas anotações aqui_' || E'\n';
    
    -- Create the file
    INSERT INTO wiki_files (folder_id, name, file_type, content, tarefa_id)
    VALUES (tasks_folder_id, file_name, 'markdown', file_content, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Parte 3: Criar função para atualizar Wiki quando checklist é modificado
CREATE OR REPLACE FUNCTION public.update_task_wiki_on_checklist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  wiki_file_record RECORD;
  checklist_section TEXT;
  all_items RECORD;
  completed_count INTEGER;
  total_count INTEGER;
  user_email TEXT;
  new_content TEXT;
  before_checklist TEXT;
  after_checklist TEXT;
  checklist_start INTEGER;
  history_start INTEGER;
BEGIN
  -- Find the wiki file for this task
  SELECT * INTO wiki_file_record 
  FROM wiki_files WHERE tarefa_id = NEW.tarefa_id LIMIT 1;
  
  IF wiki_file_record IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Count totals
  SELECT 
    COUNT(*) FILTER (WHERE concluido = true) as completed,
    COUNT(*) as total
  INTO completed_count, total_count
  FROM tarefa_checklists WHERE tarefa_id = NEW.tarefa_id;
  
  -- Build checklist section
  checklist_section := E'## Checklist de Progresso\n\n';
  checklist_section := checklist_section || '| ✓ | Item | Concluído em | Por |' || E'\n';
  checklist_section := checklist_section || '|---|------|--------------|-----|' || E'\n';
  
  FOR all_items IN 
    SELECT * FROM tarefa_checklists 
    WHERE tarefa_id = NEW.tarefa_id 
    ORDER BY position
  LOOP
    IF all_items.concluido THEN
      -- Get user email for completed items
      SELECT email INTO user_email FROM auth.users WHERE id = all_items.completed_by;
      
      checklist_section := checklist_section || 
        '| ✅ | ' || all_items.texto || ' | ' || 
        COALESCE(to_char(all_items.completed_at, 'DD/MM/YYYY HH24:MI'), '-') || ' | ' ||
        COALESCE(user_email, '-') || ' |' || E'\n';
    ELSE
      checklist_section := checklist_section || 
        '| ⬜ | ' || all_items.texto || ' | - | - |' || E'\n';
    END IF;
  END LOOP;
  
  -- Add progress bar
  IF total_count > 0 THEN
    checklist_section := checklist_section || E'\n**Progresso**: ' || 
      completed_count || '/' || total_count || 
      ' (' || ROUND(completed_count::numeric / total_count * 100) || '%)' || E'\n\n---\n\n';
  ELSE
    checklist_section := checklist_section || E'\n**Progresso**: 0/0 (0%)\n\n---\n\n';
  END IF;
  
  -- Find positions to replace checklist section
  checklist_start := position('## Checklist de Progresso' in wiki_file_record.content);
  history_start := position('## Histórico de Atividades' in wiki_file_record.content);
  
  IF checklist_start > 0 AND history_start > 0 THEN
    before_checklist := substring(wiki_file_record.content from 1 for checklist_start - 1);
    after_checklist := substring(wiki_file_record.content from history_start);
    
    new_content := before_checklist || checklist_section || after_checklist;
    
    UPDATE wiki_files 
    SET content = new_content, updated_at = now() 
    WHERE id = wiki_file_record.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Parte 4: Criar trigger para atualizar Wiki ao marcar/desmarcar checklist
DROP TRIGGER IF EXISTS on_checklist_update ON tarefa_checklists;
CREATE TRIGGER on_checklist_update
AFTER UPDATE ON tarefa_checklists
FOR EACH ROW
WHEN (OLD.concluido IS DISTINCT FROM NEW.concluido)
EXECUTE FUNCTION update_task_wiki_on_checklist();

-- Parte 5: Criar trigger para atualizar Wiki ao adicionar novo item de checklist
DROP TRIGGER IF EXISTS on_checklist_insert ON tarefa_checklists;
CREATE TRIGGER on_checklist_insert
AFTER INSERT ON tarefa_checklists
FOR EACH ROW
EXECUTE FUNCTION update_task_wiki_on_checklist();