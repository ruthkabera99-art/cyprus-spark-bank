-- Create loan_payments table to track payment history
CREATE TABLE public.loan_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_method TEXT NOT NULL DEFAULT 'traditional', -- 'traditional' or 'crypto'
  status TEXT NOT NULL DEFAULT 'completed',
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own loan payments
CREATE POLICY "Users can view own loan payments"
ON public.loan_payments
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own loan payments
CREATE POLICY "Users can insert own loan payments"
ON public.loan_payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all loan payments
CREATE POLICY "Admins can view all loan payments"
ON public.loan_payments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage loan payments
CREATE POLICY "Admins can insert loan payments"
ON public.loan_payments
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update loan payments"
ON public.loan_payments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete loan payments"
ON public.loan_payments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_loan_payments_loan_id ON public.loan_payments(loan_id);
CREATE INDEX idx_loan_payments_user_id ON public.loan_payments(user_id);

-- Create trigger to update loan when payment is made
CREATE OR REPLACE FUNCTION public.handle_loan_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  loan_record RECORD;
  new_amount_paid NUMERIC;
  new_remaining_payments INTEGER;
  new_next_payment_date DATE;
BEGIN
  -- Get the loan record
  SELECT * INTO loan_record FROM loan_applications WHERE id = NEW.loan_id;
  
  IF loan_record IS NULL THEN
    RAISE EXCEPTION 'Loan not found';
  END IF;
  
  -- Calculate new amount paid
  new_amount_paid := COALESCE(loan_record.amount_paid, 0) + NEW.amount;
  
  -- Calculate remaining payments
  new_remaining_payments := COALESCE(loan_record.remaining_payments, loan_record.term_months) - 1;
  IF new_remaining_payments < 0 THEN
    new_remaining_payments := 0;
  END IF;
  
  -- Calculate next payment date (add 1 month)
  new_next_payment_date := COALESCE(loan_record.next_payment_date, CURRENT_DATE) + INTERVAL '1 month';
  
  -- Update the loan application
  UPDATE loan_applications
  SET 
    amount_paid = new_amount_paid,
    remaining_payments = new_remaining_payments,
    next_payment_date = new_next_payment_date,
    status = CASE 
      WHEN new_amount_paid >= loan_record.amount THEN 'paid_off'::loan_status
      ELSE status 
    END
  WHERE id = NEW.loan_id;
  
  -- Deduct from user's traditional balance
  UPDATE profiles
  SET traditional_balance = COALESCE(traditional_balance, 0) - NEW.amount
  WHERE id = NEW.user_id;
  
  -- Create a transaction record for the payment
  INSERT INTO transactions (
    user_id,
    type,
    category,
    currency,
    amount,
    status,
    description,
    reference_id
  ) VALUES (
    NEW.user_id,
    'loan_payment',
    'traditional',
    'USD',
    NEW.amount,
    'completed',
    'Loan Payment - ' || loan_record.purpose,
    'LOAN-PAY-' || NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for loan payment
CREATE TRIGGER on_loan_payment_inserted
  AFTER INSERT ON public.loan_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_loan_payment();