-- Create board_settings table for Tarefas and Projetos boards
CREATE TABLE board_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_type text NOT NULL,
  hide_overdue_columns text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(board_type)
);

-- Insert initial settings
INSERT INTO board_settings (board_type) VALUES ('tarefas'), ('projetos');

-- Enable RLS
ALTER TABLE board_settings ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users
CREATE POLICY "Authenticated users can manage board_settings" ON board_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);