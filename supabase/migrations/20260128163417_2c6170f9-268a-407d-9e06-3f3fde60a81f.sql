-- Create custom_board_columns table
CREATE TABLE public.custom_board_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.custom_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create custom_board_cards table
CREATE TABLE public.custom_board_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.custom_boards(id) ON DELETE CASCADE,
  column_id UUID REFERENCES public.custom_board_columns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  assigned_users TEXT[] DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  checklist JSONB DEFAULT '[]',
  attachments_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  archived BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create custom_board_card_comments table
CREATE TABLE public.custom_board_card_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.custom_board_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create custom_board_card_activities table
CREATE TABLE public.custom_board_card_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.custom_board_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.custom_board_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_board_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_board_card_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_board_card_activities ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check board access
CREATE OR REPLACE FUNCTION public.has_board_access(board_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.custom_boards
    WHERE id = board_id
    AND (
      visibility = 'all'
      OR created_by = auth.uid()
      OR (auth.uid())::text = ANY(allowed_users)
    )
  )
$$;

-- RLS policies for custom_board_columns
CREATE POLICY "Users can view columns of accessible boards"
ON public.custom_board_columns FOR SELECT
USING (public.has_board_access(board_id));

CREATE POLICY "Users can insert columns in accessible boards"
ON public.custom_board_columns FOR INSERT
WITH CHECK (public.has_board_access(board_id));

CREATE POLICY "Users can update columns in accessible boards"
ON public.custom_board_columns FOR UPDATE
USING (public.has_board_access(board_id));

CREATE POLICY "Users can delete columns in accessible boards"
ON public.custom_board_columns FOR DELETE
USING (public.has_board_access(board_id));

-- RLS policies for custom_board_cards
CREATE POLICY "Users can view cards of accessible boards"
ON public.custom_board_cards FOR SELECT
USING (public.has_board_access(board_id));

CREATE POLICY "Users can insert cards in accessible boards"
ON public.custom_board_cards FOR INSERT
WITH CHECK (public.has_board_access(board_id));

CREATE POLICY "Users can update cards in accessible boards"
ON public.custom_board_cards FOR UPDATE
USING (public.has_board_access(board_id));

CREATE POLICY "Users can delete cards in accessible boards"
ON public.custom_board_cards FOR DELETE
USING (public.has_board_access(board_id));

-- RLS policies for custom_board_card_comments
CREATE POLICY "Users can view comments of accessible cards"
ON public.custom_board_card_comments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.custom_board_cards c
  WHERE c.id = card_id AND public.has_board_access(c.board_id)
));

CREATE POLICY "Users can insert comments"
ON public.custom_board_card_comments FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.custom_board_cards c
  WHERE c.id = card_id AND public.has_board_access(c.board_id)
));

CREATE POLICY "Users can update own comments"
ON public.custom_board_card_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.custom_board_card_comments FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for custom_board_card_activities
CREATE POLICY "Users can view activities of accessible cards"
ON public.custom_board_card_activities FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.custom_board_cards c
  WHERE c.id = card_id AND public.has_board_access(c.board_id)
));

CREATE POLICY "Users can insert activities"
ON public.custom_board_card_activities FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.custom_board_cards c
  WHERE c.id = card_id AND public.has_board_access(c.board_id)
));

-- Create function to automatically create default columns for new boards
CREATE OR REPLACE FUNCTION public.create_default_board_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.custom_board_columns (board_id, name, color, position)
  VALUES
    (NEW.id, 'Backlog', '#94a3b8', 0),
    (NEW.id, 'A Fazer', '#3b82f6', 1),
    (NEW.id, 'Em Andamento', '#f59e0b', 2),
    (NEW.id, 'Revisão', '#8b5cf6', 3),
    (NEW.id, 'Concluído', '#22c55e', 4);
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create columns
CREATE TRIGGER create_board_columns_trigger
AFTER INSERT ON public.custom_boards
FOR EACH ROW
EXECUTE FUNCTION public.create_default_board_columns();

-- Create indexes for better performance
CREATE INDEX idx_custom_board_columns_board_id ON public.custom_board_columns(board_id);
CREATE INDEX idx_custom_board_cards_board_id ON public.custom_board_cards(board_id);
CREATE INDEX idx_custom_board_cards_column_id ON public.custom_board_cards(column_id);
CREATE INDEX idx_custom_board_card_comments_card_id ON public.custom_board_card_comments(card_id);
CREATE INDEX idx_custom_board_card_activities_card_id ON public.custom_board_card_activities(card_id);