-- =============================================
-- WIKI MODULE - TABLES, BUCKET, TRIGGERS, RLS
-- =============================================

-- 1. Create wiki_folders table
CREATE TABLE public.wiki_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.wiki_folders(id) ON DELETE CASCADE,
  folder_type TEXT NOT NULL DEFAULT 'manual' CHECK (folder_type IN ('root', 'general', 'clients', 'client', 'project', 'tasks', 'manual')),
  entity_id TEXT,
  entity_type TEXT CHECK (entity_type IN ('cliente', 'projeto', NULL)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Create wiki_files table
CREATE TABLE public.wiki_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES public.wiki_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'markdown' CHECK (file_type IN ('markdown', 'pdf', 'docx', 'xlsx', 'image', 'other')),
  content TEXT,
  storage_path TEXT,
  tarefa_id UUID REFERENCES public.projeto_tarefas(id) ON DELETE SET NULL,
  size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. Create indexes for performance
CREATE INDEX idx_wiki_folders_parent ON public.wiki_folders(parent_id);
CREATE INDEX idx_wiki_folders_entity ON public.wiki_folders(entity_type, entity_id);
CREATE INDEX idx_wiki_files_folder ON public.wiki_files(folder_id);
CREATE INDEX idx_wiki_files_tarefa ON public.wiki_files(tarefa_id);

-- 4. Enable RLS
ALTER TABLE public.wiki_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_files ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for wiki_folders
CREATE POLICY "Authenticated users can view wiki folders"
  ON public.wiki_folders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create wiki folders"
  ON public.wiki_folders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update wiki folders"
  ON public.wiki_folders FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete own manual folders"
  ON public.wiki_folders FOR DELETE
  TO authenticated
  USING (folder_type = 'manual' AND created_by = auth.uid());

-- 6. RLS Policies for wiki_files
CREATE POLICY "Authenticated users can view wiki files"
  ON public.wiki_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create wiki files"
  ON public.wiki_files FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update wiki files"
  ON public.wiki_files FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete own wiki files"
  ON public.wiki_files FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- 7. Create storage bucket for wiki files
INSERT INTO storage.buckets (id, name, public)
VALUES ('wiki-files', 'wiki-files', false)
ON CONFLICT (id) DO NOTHING;

-- 8. Storage policies
CREATE POLICY "Authenticated users can upload wiki files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'wiki-files');

CREATE POLICY "Authenticated users can view wiki files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'wiki-files');

CREATE POLICY "Authenticated users can delete own wiki files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'wiki-files');

-- 9. Insert root folders (Geral and Clientes)
INSERT INTO public.wiki_folders (name, parent_id, folder_type, created_by)
VALUES 
  ('Geral', NULL, 'general', NULL),
  ('Clientes', NULL, 'clients', NULL);

-- 10. Function to create client wiki folder automatically
CREATE OR REPLACE FUNCTION public.create_client_wiki_folder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clients_folder_id UUID;
  new_client_folder_id UUID;
BEGIN
  -- Get the Clientes root folder
  SELECT id INTO clients_folder_id FROM wiki_folders WHERE folder_type = 'clients' AND parent_id IS NULL LIMIT 1;
  
  IF clients_folder_id IS NOT NULL AND NEW.name IS NOT NULL THEN
    -- Create client folder
    INSERT INTO wiki_folders (name, parent_id, folder_type, entity_id, entity_type)
    VALUES (NEW.name, clients_folder_id, 'client', NEW.id::TEXT, 'cliente')
    RETURNING id INTO new_client_folder_id;
    
    -- Create Projetos subfolder
    INSERT INTO wiki_folders (name, parent_id, folder_type, entity_id, entity_type)
    VALUES ('Projetos', new_client_folder_id, 'project', NEW.id::TEXT, 'cliente');
  END IF;
  
  RETURN NEW;
END;
$$;

-- 11. Trigger for new clients
CREATE TRIGGER trigger_create_client_wiki_folder
  AFTER INSERT ON public.metadata_clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_client_wiki_folder();

-- 12. Function to create project wiki folder automatically
CREATE OR REPLACE FUNCTION public.create_project_wiki_folder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_projetos_folder_id UUID;
  new_project_folder_id UUID;
BEGIN
  -- Only create if project has a client
  IF NEW.id_cliente IS NOT NULL AND NEW.company_name IS NOT NULL THEN
    -- Find the Projetos folder for this client
    SELECT id INTO client_projetos_folder_id 
    FROM wiki_folders 
    WHERE folder_type = 'project' 
      AND entity_type = 'cliente' 
      AND entity_id = NEW.id_cliente::TEXT
    LIMIT 1;
    
    IF client_projetos_folder_id IS NOT NULL THEN
      -- Create project folder
      INSERT INTO wiki_folders (name, parent_id, folder_type, entity_id, entity_type)
      VALUES (NEW.company_name, client_projetos_folder_id, 'project', NEW.project_id::TEXT, 'projeto')
      RETURNING id INTO new_project_folder_id;
      
      -- Create Tarefas subfolder
      INSERT INTO wiki_folders (name, parent_id, folder_type, entity_id, entity_type)
      VALUES ('Tarefas', new_project_folder_id, 'tasks', NEW.project_id::TEXT, 'projeto');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 13. Trigger for new projects
CREATE TRIGGER trigger_create_project_wiki_folder
  AFTER INSERT ON public.projetos
  FOR EACH ROW
  EXECUTE FUNCTION public.create_project_wiki_folder();

-- 14. Helper function to slugify text
CREATE OR REPLACE FUNCTION public.slugify(text_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(text_input, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$;

-- 15. Function to create task history file automatically
CREATE OR REPLACE FUNCTION public.create_task_wiki_file()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tasks_folder_id UUID;
  project_name TEXT;
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
  
  IF tasks_folder_id IS NOT NULL THEN
    -- Generate file name
    file_name := slugify(NEW.titulo) || '-' || to_char(NEW.created_at, 'YYYY-MM-DD') || '.md';
    
    -- Generate initial content
    file_content := '# ' || NEW.titulo || E'\n\n' ||
      '## Informações' || E'\n' ||
      '- **Data de Criação**: ' || to_char(NEW.created_at, 'DD/MM/YYYY HH24:MI') || E'\n' ||
      '- **Projeto**: ' || COALESCE(project_name, 'N/A') || E'\n' ||
      '- **Responsável**: ' || COALESCE(NEW.assigned_user, 'Não atribuído') || E'\n' ||
      '- **Status**: ' || COALESCE(NEW.status, 'pendente') || E'\n\n' ||
      '---' || E'\n\n' ||
      '## Histórico de Atividades' || E'\n\n' ||
      '### ' || to_char(NEW.created_at, 'DD/MM/YYYY HH24:MI') || ' - Criação' || E'\n' ||
      'Tarefa criada.' || E'\n\n' ||
      '---' || E'\n\n' ||
      '## Comentários' || E'\n\n' ||
      '(Histórico de comentários será adicionado automaticamente)' || E'\n\n' ||
      '---' || E'\n\n' ||
      '## Notas Manuais' || E'\n\n' ||
      '(Adicione notas manuais aqui)' || E'\n';
    
    -- Create the file
    INSERT INTO wiki_files (folder_id, name, file_type, content, tarefa_id)
    VALUES (tasks_folder_id, file_name, 'markdown', file_content, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- 16. Trigger for new tasks
CREATE TRIGGER trigger_create_task_wiki_file
  AFTER INSERT ON public.projeto_tarefas
  FOR EACH ROW
  EXECUTE FUNCTION public.create_task_wiki_file();

-- 17. Function to update task history when activity is logged
CREATE OR REPLACE FUNCTION public.update_task_wiki_on_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wiki_file_record RECORD;
  activity_text TEXT;
  new_content TEXT;
  activities_section_end INTEGER;
BEGIN
  -- Find the wiki file for this task
  SELECT * INTO wiki_file_record FROM wiki_files WHERE tarefa_id = NEW.tarefa_id LIMIT 1;
  
  IF wiki_file_record IS NOT NULL THEN
    -- Format activity entry
    activity_text := E'\n### ' || to_char(NEW.created_at, 'DD/MM/YYYY HH24:MI') || ' - ' || NEW.action_type || E'\n';
    
    IF NEW.field_name IS NOT NULL THEN
      activity_text := activity_text || '**Campo**: ' || NEW.field_name || E'\n';
    END IF;
    IF NEW.old_value IS NOT NULL THEN
      activity_text := activity_text || '**De**: ' || NEW.old_value || E'\n';
    END IF;
    IF NEW.new_value IS NOT NULL THEN
      activity_text := activity_text || '**Para**: ' || NEW.new_value || E'\n';
    END IF;
    IF NEW.description IS NOT NULL THEN
      activity_text := activity_text || NEW.description || E'\n';
    END IF;
    
    -- Find where to insert (before the comments section)
    activities_section_end := position('## Comentários' in wiki_file_record.content);
    
    IF activities_section_end > 0 THEN
      new_content := substring(wiki_file_record.content from 1 for activities_section_end - 1) ||
                     activity_text || E'\n---\n\n' ||
                     substring(wiki_file_record.content from activities_section_end);
      
      UPDATE wiki_files SET content = new_content, updated_at = now() WHERE id = wiki_file_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 18. Trigger for task activities
CREATE TRIGGER trigger_update_task_wiki_on_activity
  AFTER INSERT ON public.tarefa_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_task_wiki_on_activity();

-- 19. Function to update task history when comment is added
CREATE OR REPLACE FUNCTION public.update_task_wiki_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wiki_file_record RECORD;
  comment_text TEXT;
  new_content TEXT;
  comments_section_end INTEGER;
BEGIN
  -- Find the wiki file for this task
  SELECT * INTO wiki_file_record FROM wiki_files WHERE tarefa_id = NEW.tarefa_id LIMIT 1;
  
  IF wiki_file_record IS NOT NULL THEN
    -- Format comment entry
    comment_text := E'\n### ' || to_char(NEW.created_at, 'DD/MM/YYYY HH24:MI') || E'\n' ||
                    NEW.content || E'\n';
    
    -- Find where to insert (before the manual notes section)
    comments_section_end := position('## Notas Manuais' in wiki_file_record.content);
    
    IF comments_section_end > 0 THEN
      new_content := substring(wiki_file_record.content from 1 for comments_section_end - 1) ||
                     comment_text || E'\n---\n\n' ||
                     substring(wiki_file_record.content from comments_section_end);
      
      UPDATE wiki_files SET content = new_content, updated_at = now() WHERE id = wiki_file_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 20. Trigger for task comments
CREATE TRIGGER trigger_update_task_wiki_on_comment
  AFTER INSERT ON public.tarefa_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_task_wiki_on_comment();

-- 21. Update timestamp trigger
CREATE TRIGGER update_wiki_folders_updated_at
  BEFORE UPDATE ON public.wiki_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wiki_files_updated_at
  BEFORE UPDATE ON public.wiki_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();