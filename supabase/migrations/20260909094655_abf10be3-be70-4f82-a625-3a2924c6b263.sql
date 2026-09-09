CREATE UNIQUE INDEX IF NOT EXISTS card_requests_card_number_unique
  ON public.card_requests (card_number)
  WHERE card_number IS NOT NULL;