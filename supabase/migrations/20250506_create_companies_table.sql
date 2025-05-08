-- Create companies table to store company information
-- This matches the structure we're using in the application

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  registration_number TEXT,
  vat_number TEXT,
  tax_registration_number TEXT,
  csd_registration_number TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT,
  address_line2 TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  website_url TEXT,
  director_first_name TEXT,
  director_last_name TEXT,
  logo_url TEXT,
  stamp_url TEXT,
  signature_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own company data
CREATE POLICY "Users can view their own company data" 
  ON public.companies 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own company data
CREATE POLICY "Users can insert their own company data" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own company data
CREATE POLICY "Users can update their own company data" 
  ON public.companies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete only their own company data
CREATE POLICY "Users can delete their own company data" 
  ON public.companies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index on user_id for performance
CREATE INDEX companies_user_id_idx ON public.companies(user_id);

-- Audit trigger for tracking changes
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
