-- Drop the existing policy\nDROP POLICY IF EXISTS \
Donors
can
claim
open
donations\ ON donation_requests;\n\n-- Create an updated policy that allows donors to claim open donations\nCREATE POLICY \Donors
can
claim
open
donations\ \nON donation_requests\nFOR UPDATE \nTO authenticated\nUSING (status = 'open')\nWITH CHECK (status = 'pending_warehouse');
-- Also, ensure there's a policy for donors to create warehouse requests\nCREATE POLICY \
Donors
can
create
warehouse
requests\ \nON warehouse_requests\nFOR INSERT\nTO authenticated\nUSING (true);
