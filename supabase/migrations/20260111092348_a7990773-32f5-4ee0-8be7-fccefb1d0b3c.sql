-- Create a function to handle transfer recipient transactions
-- This runs with elevated privileges to bypass RLS
CREATE OR REPLACE FUNCTION public.create_recipient_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create recipient transaction for completed transfers with a recipient address (email)
  IF NEW.type = 'transfer' AND NEW.category = 'traditional' AND NEW.status = 'completed' AND NEW.recipient_address IS NOT NULL THEN
    -- Find recipient by email
    DECLARE
      recipient_id uuid;
      sender_profile RECORD;
    BEGIN
      -- Get recipient user id from profiles
      SELECT id INTO recipient_id FROM profiles WHERE email = NEW.recipient_address;
      
      -- Get sender info
      SELECT full_name, email INTO sender_profile FROM profiles WHERE id = NEW.user_id;
      
      -- Only insert if recipient exists and is different from sender
      IF recipient_id IS NOT NULL AND recipient_id != NEW.user_id THEN
        INSERT INTO transactions (
          user_id,
          type,
          category,
          currency,
          amount,
          status,
          description,
          reference_id,
          recipient_address,
          network_fee
        ) VALUES (
          recipient_id,
          'transfer',
          'traditional',
          NEW.currency,
          NEW.amount, -- Positive amount for incoming
          'completed',
          'Transfer from ' || COALESCE(sender_profile.full_name, sender_profile.email),
          NEW.reference_id || '-IN',
          NULL,
          NULL
        );
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on transactions table
DROP TRIGGER IF EXISTS on_transfer_create_recipient_transaction ON transactions;
CREATE TRIGGER on_transfer_create_recipient_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_recipient_transaction();

-- Create a function to handle loan disbursement when approved
CREATE OR REPLACE FUNCTION public.handle_loan_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile RECORD;
  crypto_bal RECORD;
BEGIN
  -- Only run when status changes to 'approved' or 'active'
  IF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status IN ('approved', 'active') THEN
    
    -- Get user's current balance
    SELECT traditional_balance INTO user_profile FROM profiles WHERE id = NEW.user_id;
    
    -- Create disbursement transaction
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
      'deposit',
      'traditional',
      'USD',
      NEW.amount,
      'completed',
      'Loan Disbursement - ' || NEW.purpose,
      'LOAN-' || NEW.id
    );
    
    -- Add loan amount to user's traditional balance
    UPDATE profiles 
    SET traditional_balance = COALESCE(traditional_balance, 0) + NEW.amount
    WHERE id = NEW.user_id;
    
    -- If crypto collateral, lock the crypto by deducting from balance
    IF NEW.collateral_type = 'crypto' AND NEW.crypto_currency IS NOT NULL AND NEW.crypto_amount IS NOT NULL THEN
      UPDATE crypto_balances
      SET amount = COALESCE(amount, 0) - NEW.crypto_amount
      WHERE user_id = NEW.user_id AND currency = NEW.crypto_currency;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on loan_applications table
DROP TRIGGER IF EXISTS on_loan_approval_disburse ON loan_applications;
CREATE TRIGGER on_loan_approval_disburse
  AFTER UPDATE ON loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_loan_approval();