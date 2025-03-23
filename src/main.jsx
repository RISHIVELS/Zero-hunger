import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * IMPORTANT: Supabase Configuration Requirements
 *
 * 1. Table Schema Requirements:
 *    The donation_requests table should have these fields:
 *    - id (UUID, primary key)
 *    - title (text)
 *    - description (text)
 *    - food_type (text)
 *    - quantity (text)
 *    - exertion_type (text)
 *    - location (text)
 *    - contact (text)
 *    - expiry_date (timestamp with time zone)
 *    - status (text) - open, claimed, confirmed, completed, cancelled
 *    - created_at (timestamp with time zone)
 *    - acceptor_id (UUID)
 *    - acceptor_name (text)
 *    - donor_id (UUID, nullable)
 *    - donor_name (text, nullable)
 *
 * 2. Supabase Row Level Security (RLS) Policies:
 *    For the donation claiming feature to work correctly, make sure these RLS policies
 *    are configured in your Supabase dashboard:
 *
 *    - Allow anyone to view open donation requests
 *    - Allow authenticated users to claim open donations
 *    - Allow donors to view and update their claimed donations
 *    - Allow acceptors to view and update their requested donations
 *
 * If you see 403 Forbidden errors, it's likely due to missing RLS policies.
 * If you see 400 Bad Request errors, check if your table schema matches the requirements.
 */

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
