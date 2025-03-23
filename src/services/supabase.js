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
    const { data, error } = await supabase
      .from("donation_requests")
      .update({
        donor_id: donorId,
        donor_name: donorName,
        status: "claimed",
      })
      .eq("id", donationId)
      .select();

    console.log("claimDonation response:", { data, error });
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
