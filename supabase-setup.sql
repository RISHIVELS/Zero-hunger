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
  warehouse_id UUID REFERENCES auth.users(id),
  warehouse_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'claimed', 'confirmed', 'pending', 'in_transit', 'delivered', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  warehouse_updated_at TIMESTAMPTZ
);

-- Step 2: Create warehouse_requests table
CREATE TABLE IF NOT EXISTS warehouse_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID NOT NULL REFERENCES donation_requests(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'declined')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Step 3: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  donation_id UUID REFERENCES donation_requests(id),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Add warehouse_secret table for warehouse access codes
CREATE TABLE IF NOT EXISTS warehouse_secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Insert a default access code (you should change this in production)
INSERT INTO warehouse_secrets (access_code, description) 
VALUES ('WAREHOUSE_SECRET_2024', 'Default warehouse access code');

-- Step 5: Enable Row Level Security
ALTER TABLE donation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_secrets ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies

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

-- Policy: Warehouse users can update confirmed donation statuses
CREATE POLICY "Warehouse users can update donation statuses"
ON donation_requests
FOR UPDATE
TO authenticated
USING (
  (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'warehouse'))
  AND status IN ('confirmed', 'pending', 'in_transit')
)
WITH CHECK (
  status IN ('pending', 'in_transit', 'delivered', 'cancelled')
);

-- Policy: Users can view notifications addressed to them
CREATE POLICY "Users can see their own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Only warehouse users can view warehouse_requests
CREATE POLICY "Warehouse users can view warehouse_requests"
ON warehouse_requests
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'warehouse'));

-- Policy: Only warehouse users can update warehouse_requests
CREATE POLICY "Warehouse users can update warehouse_requests"
ON warehouse_requests
FOR UPDATE
TO authenticated
USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'warehouse'));

-- Policy: Only warehouse users can insert warehouse_requests
CREATE POLICY "Warehouse users can insert warehouse_requests"
ON warehouse_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'warehouse'));

-- Policy: Only warehouse users and admins can view warehouse_secrets
CREATE POLICY "Only warehouse users and admins can view warehouse_secrets"
ON warehouse_secrets
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('warehouse', 'admin')));

-- Step 7: Optional - Add some sample data for testing
-- Note: To use this insert statement, replace the UUID below with a valid user ID from your auth.users table
-- or comment out this section and add sample data through the application interface
/*
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
  '00000000-0000-0000-0000-000000000000', -- Replace with a valid user ID from auth.users table
  'Community Center', 
  'open'
);
*/
