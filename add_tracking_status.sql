ALTER TABLE donation_requests ADD COLUMN IF NOT EXISTS tracking_status TEXT CHECK (tracking_status IN ('pending', 'in_transit', 'delivered'));
