-- Create custom_boards table for user-created boards
CREATE TABLE public.custom_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'layout-kanban',
  slug TEXT NOT NULL UNIQUE,
  visibility TEXT DEFAULT 'all' CHECK (visibility IN ('all', 'private', 'team', 'specific')),
  allowed_users TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_boards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view boards they have access to
CREATE POLICY "Users can view boards they have access to"
ON public.custom_boards FOR SELECT TO authenticated
USING (
  visibility = 'all' OR
  created_by = auth.uid() OR
  auth.uid()::TEXT = ANY(allowed_users)
);

-- Policy: Users can create boards
CREATE POLICY "Users can create boards"
ON public.custom_boards FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update own boards
CREATE POLICY "Users can update own boards"
ON public.custom_boards FOR UPDATE TO authenticated
USING (auth.uid() = created_by);

-- Policy: Users can delete own boards
CREATE POLICY "Users can delete own boards"
ON public.custom_boards FOR DELETE TO authenticated
USING (auth.uid() = created_by);

-- Create trigger for updating updated_at
CREATE TRIGGER update_custom_boards_updated_at
BEFORE UPDATE ON public.custom_boards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();