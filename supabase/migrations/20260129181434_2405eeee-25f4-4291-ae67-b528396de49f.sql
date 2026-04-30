-- Add is_done_column field to tarefa_board_columns
ALTER TABLE tarefa_board_columns ADD COLUMN IF NOT EXISTS is_done_column BOOLEAN DEFAULT false;

-- Add is_done_column field to custom_board_columns
ALTER TABLE custom_board_columns ADD COLUMN IF NOT EXISTS is_done_column BOOLEAN DEFAULT false;

-- Mark existing DONE columns as protected in tarefa_board_columns
UPDATE tarefa_board_columns SET is_done_column = true WHERE UPPER(name) = 'DONE';

-- Mark existing DONE columns as protected in custom_board_columns
UPDATE custom_board_columns SET is_done_column = true WHERE UPPER(name) = 'DONE';

-- Insert DONE column for tarefa board if it doesn't exist
INSERT INTO tarefa_board_columns (name, color, position, is_done_column)
SELECT 'DONE', '#22c55e', 
  COALESCE((SELECT MAX(position) + 1 FROM tarefa_board_columns), 0), 
  true
WHERE NOT EXISTS (SELECT 1 FROM tarefa_board_columns WHERE is_done_column = true);

-- Insert DONE column for each custom board that doesn't have one
INSERT INTO custom_board_columns (board_id, name, color, position, is_done_column)
SELECT b.id, 'DONE', '#22c55e',
  COALESCE((SELECT MAX(position) + 1 FROM custom_board_columns WHERE board_id = b.id), 0),
  true
FROM custom_boards b
WHERE NOT EXISTS (
  SELECT 1 FROM custom_board_columns c 
  WHERE c.board_id = b.id AND c.is_done_column = true
);