import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Supabase URL or Key is missing. Please check your environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to initialize RLS policies for donation_requests table
// This should be called once when the app starts
export const initializeRLSPolicies = async () => {
  try {
    // Create RLS policies via the Supabase client
    // These are SQL queries that need to be executed with appropriate permissions
    // Note: This requires the service role key which is not available in client-side code
    // This is for reference only and should be executed in a secure server environment or migration script

    // Policy 1: Allow anyone to view open donation requests
    // const { error: error1 } = await supabase.rpc('create_policy', {
    //   table_name: 'donation_requests',
    //   name: 'Allow anyone to view open donation requests',
    //   action: 'SELECT',
    //   definition: "status = 'open'"
    // });

    // Policy 2: Allow authenticated users to claim open donations
    // const { error: error2 } = await supabase.rpc('create_policy', {
    //   table_name: 'donation_requests',
    //   name: 'Allow authenticated users to claim open donations',
    //   action: 'UPDATE',
    //   definition: "status = 'open' AND auth.uid() IS NOT NULL"
    // });

    // Policy 3: Allow donors to view and update their claimed donations
    // const { error: error3 } = await supabase.rpc('create_policy', {
    //   table_name: 'donation_requests',
    //   name: 'Allow donors to view and update their claimed donations',
    //   action: 'UPDATE',
    //   definition: "donor_id = auth.uid()"
    // });

    console.log(
      "Note: RLS policies need to be set up in the Supabase dashboard"
    );
    console.log(
      "Please ensure the following policies exist for donation_requests table:"
    );
    console.log("1. Allow anyone to view open donation requests");
    console.log("2. Allow authenticated users to claim open donations");
    console.log("3. Allow donors to view and update their claimed donations");
    console.log(
      "4. Allow acceptors to view and update their requested donations"
    );

    return { success: true };
  } catch (error) {
    console.error("Error initializing RLS policies:", error);
    return { success: false, error };
  }
};

// Authentication functions
export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

// Database functions for donations
export const createDonationRequest = async (donationData) => {
  const { data, error } = await supabase
    .from("donation_requests")
    .insert(donationData)
    .select();
  return { data, error };
};

export const getDonationRequests = async () => {
  const { data, error } = await supabase
    .from("donation_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
};

export const getAcceptorDonations = async (acceptorId) => {
  const { data, error } = await supabase
    .from("donation_requests")
    .select("*")
    .eq("acceptor_id", acceptorId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const claimDonation = async (donationId, donorId, donorName) => {
  console.log("claimDonation called with:", { donationId, donorId, donorName });

  try {
    // First fetch the donation to make sure it exists and is open
    const { data: fetchedDonation, error: fetchError } = await supabase
      .from("donation_requests")
      .select("*")
      .eq("id", donationId)
      .single();

    if (fetchError) {
      console.error("Error fetching donation:", fetchError);
      return { data: null, error: fetchError };
    }

    if (!fetchedDonation) {
      const notFoundError = new Error("Donation not found or not available");
      console.error(notFoundError);
      return { data: null, error: notFoundError };
    }

    if (fetchedDonation.status !== "open") {
      const notAvailableError = new Error(
        "Donation is not available for claiming"
      );
      console.error(notAvailableError);
      return { data: null, error: notAvailableError };
    }

    // Skip the RPC attempt since we confirmed it doesn't exist
    // Try direct update
    const { data, error } = await supabase
      .from("donation_requests")
      .update({
        donor_id: donorId,
        donor_name: donorName,
        status: "claimed",
        // Removed updated_at as it doesn't exist in the table
      })
      .eq("id", donationId)
      .eq("status", "open") // Only update if status is still "open"
      .select();

    console.log("claimDonation direct update response:", { data, error });

    // If direct update failed, try a final approach
    if (error) {
      // Try a workaround by first selecting the donation again to establish a session connection
      await supabase.auth.getSession();
      const { data: refreshData, error: refreshError } = await supabase
        .from("donation_requests")
        .update({
          donor_id: donorId,
          donor_name: donorName,
          status: "claimed",
          // Removed updated_at as it doesn't exist in the table
        })
        .eq("id", donationId)
        .select();

      console.log("claimDonation refresh attempt response:", {
        refreshData,
        refreshError,
      });
      return { data: refreshData, error: refreshError };
    }

    return { data, error };
  } catch (err) {
    console.error("Error in claimDonation:", err);
    return { data: null, error: err };
  }
};

export const confirmDonation = async (donationId) => {
  const { data, error } = await supabase
    .from("donation_requests")
    .update({
      status: "confirmed",
    })
    .eq("id", donationId)
    .select();
  return { data, error };
};

export const updateDonationStatus = async (donationId, status) => {
  const { data, error } = await supabase
    .from("donation_requests")
    .update({ status })
    .eq("id", donationId)
    .select();
  return { data, error };
};

// Subscription for real-time updates
export const subscribeToNewDonations = (callback) => {
  return supabase
    .channel("donation_requests_channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "donation_requests",
      },
      callback
    )
    .subscribe();
};

// Subscription for real-time updates when donations are updated
export const subscribeToUpdatedDonations = (callback) => {
  return supabase
    .channel("donation_updates_channel")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "donation_requests",
      },
      callback
    )
    .subscribe();
};
