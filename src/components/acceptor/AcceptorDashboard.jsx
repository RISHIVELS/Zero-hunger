import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAcceptorDonations,
  subscribeToUpdatedDonations,
} from "../../services/supabase";
import AcceptorSidebar from "./AcceptorSidebar";
import RequestDonation from "./RequestDonation";
import DonationsList from "../common/DonationsList";

const AcceptorDashboard = () => {
  const { user, logout } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("donations");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchDonations = async () => {
      try {
        const { data, error } = await getAcceptorDonations(user.id);
        if (error) throw error;
        setDonations(data || []);
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError("Failed to load donations");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();

    // Subscribe to real-time updates for donation status changes
    const updatedDonationSubscription = subscribeToUpdatedDonations(
      (payload) => {
        const updatedDonation = payload.new;

        // Update the donation in the list if it belongs to this acceptor
        if (updatedDonation.acceptor_id === user.id) {
          setDonations((prev) =>
            prev.map((donation) =>
              donation.id === updatedDonation.id ? updatedDonation : donation
            )
          );

          // Show notification when a donation is confirmed
          if (updatedDonation.status === "confirmed") {
            setNotification({
              message: `A donor has confirmed pickup for: ${updatedDonation.title}`,
              id: updatedDonation.id,
            });

            // Clear notification after 5 seconds
            setTimeout(() => {
              setNotification(null);
            }, 5000);
          }
        }
      }
    );

    return () => {
      // Unsubscribe when component unmounts
      updatedDonationSubscription.unsubscribe();
    };
  }, [user]);

  const handleDonationSuccess = (newDonation) => {
    setDonations((prev) => [newDonation, ...prev]);
    setActiveTab("donations");
  };

  const handleDonationUpdate = (updatedDonation) => {
    setDonations((prev) =>
      prev.map((donation) =>
        donation.id === updatedDonation.id ? updatedDonation : donation
      )
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "donations":
        return (
          <DonationsList
            donations={donations}
            loading={loading}
            error={error}
            userType="acceptor"
            onUpdate={handleDonationUpdate}
          />
        );
      case "request":
        return <RequestDonation onSuccess={handleDonationSuccess} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AcceptorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logout={logout}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {notification && (
          <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-md animate-fade-in-out transition-opacity">
            <strong className="font-bold">Donation Confirmed! </strong>
            <span className="block sm:inline">{notification.message}</span>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Acceptor Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome, {user?.user_metadata?.name || "User"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default AcceptorDashboard;
