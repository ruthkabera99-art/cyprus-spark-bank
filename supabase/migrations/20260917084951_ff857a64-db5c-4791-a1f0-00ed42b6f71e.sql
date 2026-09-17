ALTER TABLE public.card_requests
  ADD COLUMN IF NOT EXISTS rejection_category text,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

COMMENT ON COLUMN public.card_requests.rejection_category IS 'Admin-selected category explaining why a card request was rejected.';
COMMENT ON COLUMN public.card_requests.rejection_reason IS 'Customer-visible explanation for a rejected card request.';