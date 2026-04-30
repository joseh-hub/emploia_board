-- Custom board card subtasks: table + RLS (CRUD, ordering, completed_at/completed_by)

CREATE TABLE public.custom_board_card_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.custom_board_cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_custom_board_card_subtasks_card_id ON public.custom_board_card_subtasks(card_id);

ALTER TABLE public.custom_board_card_subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subtasks of accessible cards"
  ON public.custom_board_card_subtasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_board_cards c
      WHERE c.id = card_id AND public.has_board_access(c.board_id)
    )
  );

CREATE POLICY "Users can insert subtasks on accessible cards"
  ON public.custom_board_card_subtasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.custom_board_cards c
      WHERE c.id = card_id AND public.has_board_access(c.board_id)
    )
  );

CREATE POLICY "Users can update subtasks of accessible cards"
  ON public.custom_board_card_subtasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_board_cards c
      WHERE c.id = card_id AND public.has_board_access(c.board_id)
    )
  );

CREATE POLICY "Users can delete subtasks of accessible cards"
  ON public.custom_board_card_subtasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_board_cards c
      WHERE c.id = card_id AND public.has_board_access(c.board_id)
    )
  );
