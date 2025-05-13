-- Migration: Create Required Tables for MokMzansi Books
-- Description: Creates company_data and app_data tables with proper indexes and RLS policies

-- Create company_data table for storing company information
CREATE TABLE IF NOT EXISTS public.company_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comments to table & columns
COMMENT ON TABLE public.company_data IS 'Store company related data';
COMMENT ON COLUMN public.company_data.type IS 'Type of data (company_details, users, audit_log)';
COMMENT ON COLUMN public.company_data.data IS 'JSON data for the company';

-- Create index
CREATE INDEX IF NOT EXISTS company_data_type_idx ON public.company_data (type);

-- Set up Row Level Security (RLS)
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE schemaname = 'public' 
    AND tablename = 'company_data' 
    AND policyname = 'Allow read access for all users'
  ) THEN
    CREATE POLICY "Allow read access for all users" 
      ON public.company_data 
      FOR SELECT 
      USING (true);
  END IF;
END
$$;

-- Create policy to allow insert access to all users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE schemaname = 'public' 
    AND tablename = 'company_data' 
    AND policyname = 'Allow insert for all users'
  ) THEN
    CREATE POLICY "Allow insert for all users" 
      ON public.company_data 
      FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- Create policy to allow update access to all users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE schemaname = 'public' 
    AND tablename = 'company_data' 
    AND policyname = 'Allow update for all users'
  ) THEN
    CREATE POLICY "Allow update for all users" 
      ON public.company_data 
      FOR UPDATE
      USING (true);
  END IF;
END
$$;

-- Create app_data table for storing application data
CREATE TABLE IF NOT EXISTS public.app_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  data_id TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comments to table & columns
COMMENT ON TABLE public.app_data IS 'Store application data';
COMMENT ON COLUMN public.app_data.type IS 'Type of data (invoice, quote, etc)';
COMMENT ON COLUMN public.app_data.data_id IS 'ID of the data in the client application';
COMMENT ON COLUMN public.app_data.data IS 'JSON data for the app';

-- Create indexes
CREATE INDEX IF NOT EXISTS app_data_type_idx ON public.app_data (type);
CREATE INDEX IF NOT EXISTS app_data_data_id_idx ON public.app_data (data_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE schemaname = 'public' 
    AND tablename = 'app_data' 
    AND policyname = 'Allow read access for all users'
  ) THEN
    CREATE POLICY "Allow read access for all users" 
      ON public.app_data 
      FOR SELECT
      USING (true);
  END IF;
END
$$;

-- Create policy to allow insert access to all users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE schemaname = 'public' 
    AND tablename = 'app_data' 
    AND policyname = 'Allow insert for all users'
  ) THEN
    CREATE POLICY "Allow insert for all users" 
      ON public.app_data 
      FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- Create policy to allow update access to all users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE schemaname = 'public' 
    AND tablename = 'app_data' 
    AND policyname = 'Allow update for all users'
  ) THEN
    CREATE POLICY "Allow update for all users" 
      ON public.app_data 
      FOR UPDATE
      USING (true);
  END IF;
END
$$;
