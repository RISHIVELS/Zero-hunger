-- Step 1: Create donation_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS donation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  food_type TEXT NOT NULL,
  exertion_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  location TEXT NOT NULL,
  contact TEXT NOT NULL,
  acceptor_id UUID NOT NULL REFERENCES auth.users(id),
  acceptor_name TEXT NOT NULL,
  donor_id UUID REFERENCES auth.users(id),
  donor_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'claimed', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Step 2: Enable Row Level Security
ALTER TABLE donation_requests ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies

-- Policy: Anyone can view donation requests
CREATE POLICY "Anyone can view donation requests"
ON donation_requests
FOR SELECT
USING (true);

-- Policy: Acceptors can create donation requests
CREATE POLICY "Acceptors can create donation requests" 
ON donation_requests
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = acceptor_id);

-- Policy: Donors can claim open donations
CREATE POLICY "Donors can claim open donations" 
ON donation_requests
FOR UPDATE 
TO authenticated
USING (status = 'open')
WITH CHECK (
  -- Allow updating when:
  -- 1. Status is changing from 'open' to 'claimed'
  -- 2. The auth user is being set as the donor
  status = 'claimed' AND 
  auth.uid() = donor_id
);

-- Policy: Donors can confirm their claimed donations
CREATE POLICY "Donors can confirm their claimed donations" 
ON donation_requests
FOR UPDATE 
TO authenticated
USING (
  status = 'claimed' AND 
  auth.uid() = donor_id
)
WITH CHECK (
  status = 'confirmed'
);

-- Policy: Acceptors can update their own donation requests
CREATE POLICY "Acceptors can update their own donations" 
ON donation_requests
FOR UPDATE 
TO authenticated
USING (auth.uid() = acceptor_id);

-- Step 4: Optional - Add some sample data for testing
INSERT INTO donation_requests (
  title, description, food_type, exertion_type, quantity, 
  expiry_date, location, contact, acceptor_id, acceptor_name, status
) VALUES (
  'Food for Community Center', 
  'Requesting food donations for our weekly community lunch program', 
  'Cooked Food', 
  'Community Center', 
  '30 meals', 
  (CURRENT_DATE + interval '7 days'), 
  '123 Main St, Anytown', 
  'contact@communitycenter.org', 
  auth.uid(), -- This needs to be a valid user ID when running
  'Community Center', 
  'open'
);
