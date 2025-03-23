# Zero Hunger

Zero Hunger is a platform that connects food donors with religious institutions and community centers to reduce food waste and fight hunger in our communities.

## Features

- **Authentication**: Sign up and login as either an Acceptor or Donor
- **Role-Based Access**: Different dashboards for Acceptors and Donors
- **Donation Requests**: Acceptors can request food donations for their religious institutions or community centers
- **Real-time Updates**: Donors receive real-time notifications when new donation requests are added
- **Claim Donations**: Donors can browse and claim donation requests
- **Track Status**: Both Acceptors and Donors can track the status of donations

## Tech Stack

- **Frontend**: React (Vite), CSS
- **Backend**: Supabase (Authentication, Database, Realtime)

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Set up the Database Schema:

   Create a `donation_requests` table with the following columns:

   - `id` (uuid, primary key)
   - `title` (text)
   - `description` (text)
   - `food_type` (text)
   - `exertion_type` (text)
   - `quantity` (text)
   - `expiry_date` (date)
   - `location` (text)
   - `contact` (text)
   - `acceptor_id` (uuid, foreign key to auth.users)
   - `acceptor_name` (text)
   - `donor_id` (uuid, foreign key to auth.users, nullable)
   - `donor_name` (text, nullable)
   - `status` (text) - can be 'open', 'claimed', 'completed', or 'cancelled'
   - `created_at` (timestamp with time zone)

3. Set up Row Level Security (RLS) policies to secure your data

### Project Setup

1. Clone the repository

   ```
   git clone <repository-url>
   cd zero-hunger
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Configure environment variables

   - Copy the `.env.example` file to `.env`

   ```
   cp .env.example .env
   ```

   - Update the `.env` file with your Supabase URL and anonymous key from your Supabase project settings

4. Start the development server

   ```
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
