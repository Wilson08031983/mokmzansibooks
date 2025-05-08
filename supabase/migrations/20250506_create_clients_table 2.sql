-- Create clients table to store client information
-- This matches the structure we're using in the application

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id TEXT NOT NULL, -- ID used in client-side localStorage
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  client_type TEXT NOT NULL CHECK (client_type IN ('company', 'individual', 'vendor')),
  contact_person TEXT, -- Only for company and vendor types
  credit DECIMAL DEFAULT 0,
  outstanding DECIMAL DEFAULT 0,
  overdue DECIMAL DEFAULT 0,
  last_interaction TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own client data
CREATE POLICY "Users can view their own client data" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own client data
CREATE POLICY "Users can insert their own client data" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own client data
CREATE POLICY "Users can update their own client data" 
  ON public.clients 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete only their own client data
CREATE POLICY "Users can delete their own client data" 
  ON public.clients 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX clients_user_id_idx ON public.clients(user_id);
CREATE INDEX clients_local_id_idx ON public.clients(local_id);
CREATE INDEX clients_client_type_idx ON public.clients(client_type);

-- Create composite unique constraint on user_id and local_id
-- This ensures each local_id is unique per user
CREATE UNIQUE INDEX clients_user_id_local_id_idx ON public.clients(user_id, local_id);

-- Audit trigger for tracking changes
CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
