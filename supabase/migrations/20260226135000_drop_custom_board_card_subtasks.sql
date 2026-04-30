-- Drop custom board card subtasks feature (table, index, policies)

DROP POLICY IF EXISTS "Users can view subtasks of accessible cards"
  ON public.custom_board_card_subtasks;

DROP POLICY IF EXISTS "Users can insert subtasks on accessible cards"
  ON public.custom_board_card_subtasks;

DROP POLICY IF EXISTS "Users can update subtasks of accessible cards"
  ON public.custom_board_card_subtasks;

DROP POLICY IF EXISTS "Users can delete subtasks of accessible cards"
  ON public.custom_board_card_subtasks;

DROP INDEX IF EXISTS public.idx_custom_board_card_subtasks_card_id;

DROP TABLE IF EXISTS public.custom_board_card_subtasks;
