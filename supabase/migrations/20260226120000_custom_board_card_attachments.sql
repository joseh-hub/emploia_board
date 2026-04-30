-- Custom board card attachments: table + bucket + RLS + trigger for attachments_count

-- 1) Table
CREATE TABLE public.custom_board_card_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.custom_board_cards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'other',
  storage_path TEXT NOT NULL,
  size_bytes BIGINT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_custom_board_card_attachments_card_id ON public.custom_board_card_attachments(card_id);

ALTER TABLE public.custom_board_card_attachments ENABLE ROW LEVEL SECURITY;

-- RLS: access via has_board_access(c.board_id)
CREATE POLICY "Users can view attachments of accessible cards"
  ON public.custom_board_card_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_board_cards c
      WHERE c.id = card_id AND public.has_board_access(c.board_id)
    )
  );

CREATE POLICY "Users can create attachments on accessible cards"
  ON public.custom_board_card_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.custom_board_cards c
      WHERE c.id = card_id AND public.has_board_access(c.board_id)
    )
  );

CREATE POLICY "Users can delete attachments of accessible cards"
  ON public.custom_board_card_attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_board_cards c
      WHERE c.id = card_id AND public.has_board_access(c.board_id)
    )
  );

-- 2) Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-board-attachments', 'custom-board-attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload custom board attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'custom-board-attachments');

CREATE POLICY "Authenticated users can view custom board attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'custom-board-attachments');

CREATE POLICY "Authenticated users can delete custom board attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'custom-board-attachments');

-- 3) Trigger to keep custom_board_cards.attachments_count in sync
CREATE OR REPLACE FUNCTION public.sync_custom_board_card_attachments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_card_id UUID;
  new_count INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_card_id := OLD.card_id;
  ELSE
    target_card_id := NEW.card_id;
  END IF;

  SELECT COUNT(*)::INTEGER INTO new_count
  FROM public.custom_board_card_attachments
  WHERE card_id = target_card_id;

  UPDATE public.custom_board_cards
  SET attachments_count = new_count, updated_at = now()
  WHERE id = target_card_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER custom_board_card_attachments_count_trigger
AFTER INSERT OR DELETE ON public.custom_board_card_attachments
FOR EACH ROW
EXECUTE FUNCTION public.sync_custom_board_card_attachments_count();
