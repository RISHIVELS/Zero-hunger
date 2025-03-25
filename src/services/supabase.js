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

// Warehouse authentication
export const checkWarehouseCode = async (code) => {
  const { data, error } = await supabase
    .from("warehouse_secrets")
    .select("*")
    .eq("access_code", code)
    .eq("is_active", true)
    .single();

  if (data) {
    // Update last_used_at timestamp
    await supabase
      .from("warehouse_secrets")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id);
  }

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

    // Try the update with RPC instead of direct update
    // This might bypass some RLS issues
    const { data, error } = await supabase.rpc("claim_donation", {
      donation_id: donationId,
      donor_id: donorId,
      donor_name: donorName,
    });

    // If RPC is not available, fall back to direct update
    if (error && error.code === "42883") {
      // Function doesn't exist
      console.log(
        "Claim donation RPC not available, falling back to direct update"
      );
      const { data: updateData, error: updateError } = await supabase
        .from("donation_requests")
        .update({
          donor_id: donorId,
          donor_name: donorName,
          status: "claimed",
        })
        .eq("id", donationId)
        .eq("status", "open") // Only update if status is still "open"
        .select();

      if (updateError) {
        console.error("Error in direct update:", updateError);
        return { data: null, error: updateError };
      }

      return { data: updateData, error: null };
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
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", donationId)
    .select();

  // Update warehouse request to pending for approval
  if (data && data.length > 0) {
    await updateWarehouseRequest(donationId, "pending");
  }

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

// Warehouse-specific functions
export const createWarehouseRequest = async (donationId) => {
  const { data, error } = await supabase
    .from("warehouse_requests")
    .insert({
      donation_id: donationId,
      status: "pending",
      created_at: new Date().toISOString(),
    })
    .select();
  return { data, error };
};

export const updateWarehouseRequest = async (
  donationId,
  status,
  notes = null
) => {
  const { data, error } = await supabase
    .from("warehouse_requests")
    .update({
      status: status,
      notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("donation_id", donationId)
    .select();
  return { data, error };
};

export const getWarehouseRequests = async (status = null) => {
  let query = supabase
    .from("warehouse_requests")
    .select(
      `
      *,
      donation_requests (*)
    `
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  return { data, error };
};

export const updateDonationTracking = async (
  donationId,
  status,
  warehouseId,
  warehouseName
) => {
  const { data: donation, error: fetchError } = await supabase
    .from("donation_requests")
    .select("*")
    .eq("id", donationId)
    .single();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  // Update the donation status
  const { data, error } = await supabase
    .from("donation_requests")
    .update({
      status: status,
      warehouse_id: warehouseId,
      warehouse_name: warehouseName,
      warehouse_updated_at: new Date().toISOString(),
    })
    .eq("id", donationId)
    .select();

  if (error) {
    return { data: null, error: error };
  }

  // Create notifications for donor and acceptor
  if (data && data.length > 0) {
    const donationData = data[0];
    const message = `Your donation "${donationData.title}" has been updated to status: ${status}`;

    // Notify donor
    if (donationData.donor_id) {
      await createNotification(
        donationData.donor_id,
        `Donation Status: ${status}`,
        message,
        donationId
      );
    }

    // Notify acceptor
    await createNotification(
      donationData.acceptor_id,
      `Donation Status: ${status}`,
      message,
      donationId
    );

    // Update warehouse request status
    if (status === "delivered" || status === "cancelled") {
      const finalStatus = status === "delivered" ? "approved" : "declined";
      await updateWarehouseRequest(donationId, finalStatus);
    }
  }

  return { data, error };
};

// Notification functions
export const createNotification = async (
  userId,
  title,
  message,
  donationId
) => {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title: title,
      message: message,
      donation_id: donationId,
      created_at: new Date().toISOString(),
    })
    .select();
  return { data, error };
};

export const getUserNotifications = async (userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const markNotificationAsRead = async (notificationId) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
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

// Subscription for real-time updates for notifications
export const subscribeToUserNotifications = (userId, callback) => {
  return supabase
    .channel("user_notifications_channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

// Additional subscription for warehouse requests
export const subscribeToWarehouseRequests = (callback) => {
  return supabase
    .channel("warehouse_requests_channel")
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "warehouse_requests",
      },
      callback
    )
    .subscribe();
};
