-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  traditional_balance DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create crypto_balances table
CREATE TABLE public.crypto_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('BTC', 'ETH', 'USDT')),
  amount DECIMAL(18,8) DEFAULT 0,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, currency)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'loan_disbursement', 'loan_payment')),
  category TEXT NOT NULL CHECK (category IN ('traditional', 'crypto')),
  currency TEXT NOT NULL,
  amount DECIMAL(18,8) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  reference_id TEXT,
  recipient_address TEXT,
  network_fee DECIMAL(18,8),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create collateral_type enum
CREATE TYPE public.collateral_type AS ENUM ('real_estate', 'vehicle', 'equipment', 'crypto', 'other');

-- Create loan_status enum
CREATE TYPE public.loan_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'active', 'paid_off');

-- Create loan_applications table
CREATE TABLE public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  purpose TEXT NOT NULL,
  term_months INTEGER NOT NULL CHECK (term_months IN (6, 12, 24, 36)),
  interest_rate DECIMAL(5,2) NOT NULL,
  monthly_payment DECIMAL(15,2) NOT NULL,
  collateral_type collateral_type NOT NULL,
  collateral_value DECIMAL(15,2) NOT NULL,
  collateral_description TEXT,
  crypto_currency TEXT,
  crypto_amount DECIMAL(18,8),
  ltv_ratio DECIMAL(5,2),
  status loan_status DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  next_payment_date DATE,
  remaining_payments INTEGER
);

-- Create collateral_documents table
CREATE TABLE public.collateral_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collateral_documents ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Crypto balances policies
CREATE POLICY "Users can view own crypto balances" ON public.crypto_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own crypto balances" ON public.crypto_balances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crypto balances" ON public.crypto_balances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Loan applications policies
CREATE POLICY "Users can view own loan applications" ON public.loan_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loan applications" ON public.loan_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loan applications" ON public.loan_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Collateral documents policies
CREATE POLICY "Users can view own collateral documents" ON public.collateral_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.loan_applications la
      WHERE la.id = loan_application_id AND la.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own collateral documents" ON public.collateral_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.loan_applications la
      WHERE la.id = loan_application_id AND la.user_id = auth.uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Initialize crypto balances
  INSERT INTO public.crypto_balances (user_id, currency, amount)
  VALUES 
    (NEW.id, 'BTC', 0),
    (NEW.id, 'ETH', 0),
    (NEW.id, 'USDT', 0);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_crypto_balances_updated_at
  BEFORE UPDATE ON public.crypto_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create storage bucket for collateral documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('collateral-documents', 'collateral-documents', false);

-- Storage policies for collateral documents
CREATE POLICY "Users can upload collateral documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'collateral-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own collateral documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'collateral-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own collateral documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'collateral-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);