CREATE TYPE public.card_type AS ENUM ('visa', 'mastercard', 'btc');
CREATE TYPE public.card_request_status AS ENUM ('pending', 'approved', 'rejected', 'issued', 'cancelled');

CREATE TABLE public.card_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  card_type public.card_type NOT NULL,
  cardholder_name text NOT NULL,
  delivery_address text,
  phone text,
  status public.card_request_status NOT NULL DEFAULT 'pending',
  admin_note text,
  card_number text,
  expiry_month integer,
  expiry_year integer,
  cvv text,
  issued_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_requests TO authenticated;
GRANT ALL ON public.card_requests TO service_role;

ALTER TABLE public.card_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own card requests"
ON public.card_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own card requests"
ON public.card_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update card requests"
ON public.card_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own pending requests"
ON public.card_requests FOR DELETE TO authenticated
USING ((auth.uid() = user_id AND status = 'pending') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_card_requests_updated_at
BEFORE UPDATE ON public.card_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_card_requests_user_id ON public.card_requests(user_id);
CREATE INDEX idx_card_requests_status ON public.card_requests(status);