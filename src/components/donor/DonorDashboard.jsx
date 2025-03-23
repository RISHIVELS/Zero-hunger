import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getDonationRequests,
  subscribeToNewDonations,
  subscribeToUpdatedDonations,
} from "../../services/supabase";
import DonorSidebar from "./DonorSidebar";
import DonationsList from "../common/DonationsList";

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Only fetch donations if user is defined
    if (!user) return;

    const fetchDonations = async () => {
      try {
        const { data, error } = await getDonationRequests();
        if (error) throw error;
        setDonations(data || []);
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError("Failed to load donation requests");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();

    // Subscribe to real-time updates for new donations
    const newDonationSubscription = subscribeToNewDonations((payload) => {
      const newDonation = payload.new;

      // Add the new donation to the list
      setDonations((prev) => [newDonation, ...prev]);

      // Show a notification
      setNotification({
        message: `New donation request: ${newDonation.title}`,
        id: newDonation.id,
        type: "new",
      });

      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    });

    // Subscribe to real-time updates for updated donations
    const updatedDonationSubscription = subscribeToUpdatedDonations(
      (payload) => {
        const updatedDonation = payload.new;

        // Update the donation in the list
        setDonations((prev) =>
          prev.map((donation) =>
            donation.id === updatedDonation.id ? updatedDonation : donation
          )
        );

        // If this donation was confirmed and belongs to this donor, show notification
        if (
          updatedDonation.status === "confirmed" &&
          updatedDonation.donor_id === user.id
        ) {
          setNotification({
            message: `Donation confirmed: ${updatedDonation.title}`,
            id: updatedDonation.id,
            type: "confirmed",
          });

          // Clear notification after 5 seconds
          setTimeout(() => {
            setNotification(null);
          }, 5000);
        }
      }
    );

    return () => {
      // Unsubscribe when component unmounts
      newDonationSubscription.unsubscribe();
      updatedDonationSubscription.unsubscribe();
    };
  }, [user]); // Add user to dependency array

  // Update donation in the list when it's claimed or status is updated
  const handleDonationUpdate = (updatedDonation) => {
    // Guard against undefined updatedDonation
    if (!updatedDonation || !updatedDonation.id) return;

    setDonations((prev) => {
      // Filter out any undefined donations and then map
      return prev
        .filter(Boolean)
        .map((donation) =>
          donation && donation.id === updatedDonation.id
            ? updatedDonation
            : donation
        );
    });
  };

  // Filter donations based on active tab
  const filteredDonations = donations.filter((donation) => {
    // Guard against undefined donations
    if (!donation) return false;

    if (activeTab === "available") {
      return donation.status === "open";
    } else if (activeTab === "claimed" && user) {
      return donation.status === "claimed" && donation.donor_id === user.id;
    } else if (activeTab === "confirmed" && user) {
      return donation.status === "confirmed" && donation.donor_id === user.id;
    }
    return true;
  });

  // Show loading indicator if user authentication is not completed
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DonorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logout={logout}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {notification && (
          <div
            className={`fixed top-4 right-4 ${
              notification.type === "confirmed"
                ? "bg-blue-100 border-blue-400 text-blue-700"
                : "bg-green-100 border-green-400 text-green-700"
            } px-4 py-3 rounded shadow-md animate-fade-in-out transition-opacity border`}
          >
            <strong className="font-bold">
              {notification.type === "confirmed"
                ? "Confirmed! "
                : "New Request! "}
            </strong>
            <span className="block sm:inline">{notification.message}</span>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Donor Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {user?.user_metadata?.name || "User"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <DonationsList
            donations={filteredDonations}
            loading={loading}
            error={error}
            userType="donor"
            onUpdate={handleDonationUpdate}
          />
        </div>
      </main>
    </div>
  );
};

export default DonorDashboard;
