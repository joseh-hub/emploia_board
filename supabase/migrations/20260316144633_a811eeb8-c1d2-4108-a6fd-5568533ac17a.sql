
-- Move all Bulbe cards to "Tarefas (KAs)" board, first column "Backlog"
UPDATE custom_board_cards
SET board_id = 'e4f35144-5869-4b69-ac85-59d88998b1ea',
    column_id = '90abb49b-11a1-4661-a80d-c26273fab82b'
WHERE board_id = '8f451ac4-c563-4e91-8057-a54e98bf6384';

-- Delete Bulbe columns
DELETE FROM custom_board_columns WHERE board_id = '8f451ac4-c563-4e91-8057-a54e98bf6384';

-- Delete Bulbe board
DELETE FROM custom_boards WHERE id = '8f451ac4-c563-4e91-8057-a54e98bf6384';
