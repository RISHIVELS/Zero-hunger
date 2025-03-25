import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getDonationRequests,
  subscribeToNewDonations,
  subscribeToUpdatedDonations,
  subscribeToUserNotifications,
  claimDonation,
  confirmDonation,
} from "../../services/supabase";
import DonorSidebar from "./DonorSidebar";
import DonationsList from "../common/DonationsList";
import TrackingStatus from "../common/TrackingStatus";
import NotificationCenter from "../common/NotificationCenter";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  PolarAreaController,
} from "chart.js";
import { Doughnut, Bar, PolarArea } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PolarAreaController,
  Title,
  Tooltip,
  Legend
);

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    totalAvailable: 0,
    claimed: 0,
    confirmed: 0,
    monthlyDonations: [0, 0, 0, 0, 0, 0],
    categoryData: [0, 0, 0, 0, 0],
  });

  useEffect(() => {
    // Only fetch donations if user is defined
    if (!user) return;

    const fetchDonations = async () => {
      try {
        const { data, error } = await getDonationRequests();
        if (error) throw error;
        setDonations(data || []);

        // Calculate statistics
        if (data && data.length > 0) {
          // Count donation status
          const totalAvailable = data.filter((d) => d.status === "open").length;
          const claimed = data.filter(
            (d) => d.status === "claimed" && d.donor_id === user.id
          ).length;
          const confirmed = data.filter(
            (d) => d.status === "confirmed" && d.donor_id === user.id
          ).length;

          // Generate mock monthly data (in a real app, you would derive this from real data)
          const monthlyDonations = [
            Math.floor(Math.random() * 5),
            Math.floor(Math.random() * 5) + 1,
            Math.floor(Math.random() * 5) + 2,
            claimed > 0 ? claimed - 1 : Math.floor(Math.random() * 3),
            claimed > 0 ? claimed : Math.floor(Math.random() * 3) + 1,
            confirmed + claimed, // Current month
          ];

          // Generate mock category data (in a real app, you would derive this from real data)
          // Categories: Meals, Groceries, Produce, Bakery, Other
          const categoryData = [
            Math.floor(Math.random() * 10) + 5,
            Math.floor(Math.random() * 10) + 3,
            Math.floor(Math.random() * 10) + 2,
            Math.floor(Math.random() * 10) + 1,
            Math.floor(Math.random() * 5) + 1,
          ];

          setStats({
            totalAvailable,
            claimed,
            confirmed,
            monthlyDonations,
            categoryData,
          });
        }
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

  // Doughnut chart data for donation status
  const statusChartData = {
    labels: ["Available", "Claimed", "Confirmed"],
    datasets: [
      {
        data: [stats.totalAvailable, stats.claimed, stats.confirmed],
        backgroundColor: [
          "rgba(234, 179, 8, 0.8)", // Yellow for available
          "rgba(59, 130, 246, 0.8)", // Blue for claimed
          "rgba(34, 197, 94, 0.8)", // Green for confirmed
        ],
        borderColor: [
          "rgba(234, 179, 8, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data for monthly donations
  const monthlyChartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Your Donations",
        data: stats.monthlyDonations,
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Polar area chart for donation categories
  const categoryChartData = {
    labels: ["Meals", "Groceries", "Produce", "Bakery", "Other"],
    datasets: [
      {
        data: stats.categoryData,
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)", // Red
          "rgba(16, 185, 129, 0.7)", // Green
          "rgba(59, 130, 246, 0.7)", // Blue
          "rgba(245, 158, 11, 0.7)", // Amber
          "rgba(139, 92, 246, 0.7)", // Purple
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
            weight: "bold",
          },
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Donations",
          font: {
            size: 12,
            weight: "bold",
          },
          color: "#4b5563",
        },
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Update donation in the list when it's claimed or status is updated
  const handleDonationUpdate = (updatedDonation) => {
    // Guard against undefined updatedDonation
    if (!updatedDonation || !updatedDonation.id) return;

    const oldDonation = donations.find((d) => d && d.id === updatedDonation.id);

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

    // Update stats when a donation status changes
    if (oldDonation && oldDonation.status !== updatedDonation.status) {
      setStats((prev) => {
        const newStats = { ...prev };

        // Handle available count
        if (oldDonation.status === "open") newStats.totalAvailable--;
        if (updatedDonation.status === "open") newStats.totalAvailable++;

        // Handle donor's claimed donations
        if (
          oldDonation.status === "claimed" &&
          oldDonation.donor_id === user.id
        )
          newStats.claimed--;
        if (
          updatedDonation.status === "claimed" &&
          updatedDonation.donor_id === user.id
        )
          newStats.claimed++;

        // Handle donor's confirmed donations
        if (
          oldDonation.status === "confirmed" &&
          oldDonation.donor_id === user.id
        )
          newStats.confirmed--;
        if (
          updatedDonation.status === "confirmed" &&
          updatedDonation.donor_id === user.id
        )
          newStats.confirmed++;

        return newStats;
      });
    }
  };

  // Add these functions before the renderTabContent function
  const handleClaimDonation = async (donationId) => {
    try {
      setLoading(true);
      const { data, error } = await claimDonation(
        donationId,
        user.id,
        user.user_metadata?.name || "Anonymous Donor"
      );

      if (error) throw error;

      // Update local state
      setDonations((prev) =>
        prev.map((donation) =>
          donation.id === donationId
            ? {
                ...donation,
                donor_id: user.id,
                donor_name: user.user_metadata?.name || "Anonymous Donor",
                status: "claimed",
              }
            : donation
        )
      );

      // Show notification
      setNotification({
        message: `You have successfully claimed this donation.`,
        id: donationId,
        type: "claimed",
      });

      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (err) {
      console.error("Error claiming donation:", err);
      setError("Failed to claim donation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDonation = async (donationId) => {
    try {
      setLoading(true);
      const { data, error } = await confirmDonation(donationId);

      if (error) throw error;

      // Update local state
      setDonations((prev) =>
        prev.map((donation) =>
          donation.id === donationId
            ? { ...donation, status: "confirmed" }
            : donation
        )
      );

      // Show notification
      setNotification({
        message: `You have confirmed the donation. It's now awaiting warehouse verification.`,
        id: donationId,
        type: "confirmed",
      });

      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (err) {
      console.error("Error confirming donation:", err);
      setError("Failed to confirm donation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Create or update the renderTabContent function to include tracking
  const renderTabContent = () => {
    const filteredDonations = donations.filter((donation) => {
      switch (activeTab) {
        case "available":
          return donation.status === "open";
        case "claimed":
          return donation.status === "claimed" && donation.donor_id === user.id;
        case "in_process":
          return (
            ["confirmed", "pending", "in_transit"].includes(donation.status) &&
            donation.donor_id === user.id
          );
        case "completed":
          return (
            ["delivered", "cancelled"].includes(donation.status) &&
            donation.donor_id === user.id
          );
        default:
          return true;
      }
    });

    const getEmptyMessage = () => {
      switch (activeTab) {
        case "available":
          return "No available donation requests";
        case "claimed":
          return "You haven't claimed any donations yet";
        case "in_process":
          return "No donations in process";
        case "completed":
          return "No completed donations";
        default:
          return "No donations found";
      }
    };

    if (filteredDonations.length === 0) {
      return (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-500">{getEmptyMessage()}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredDonations.map((donation) => (
          <div
            key={donation.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-200"
          >
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-medium text-gray-800">
                {donation.title}
              </h3>
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    donation.status === "open"
                      ? "bg-yellow-100 text-yellow-800"
                      : donation.status === "claimed"
                      ? "bg-blue-100 text-blue-800"
                      : donation.status === "confirmed" ||
                        donation.status === "pending" ||
                        donation.status === "in_transit"
                      ? "bg-purple-100 text-purple-800"
                      : donation.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {donation.status === "open"
                    ? "Available"
                    : donation.status === "claimed"
                    ? "Claimed by you"
                    : donation.status === "confirmed"
                    ? "Waiting for Warehouse"
                    : donation.status === "pending"
                    ? "Processing"
                    : donation.status === "in_transit"
                    ? "In Transit"
                    : donation.status === "delivered"
                    ? "Delivered"
                    : "Cancelled"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Type</p>
                <p className="font-medium text-gray-800">
                  {donation.food_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Quantity</p>
                <p className="font-medium text-gray-800">{donation.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Expires</p>
                <p className="font-medium text-gray-800">
                  {new Date(donation.expiry_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="font-medium text-gray-800">{donation.location}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-800">{donation.description}</p>
            </div>

            {/* Display tracking status for confirmed/in-process donations */}
            {[
              "confirmed",
              "pending",
              "in_transit",
              "delivered",
              "cancelled",
            ].includes(donation.status) && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Tracking Status
                </h4>
                <TrackingStatus currentStatus={donation.status} />
                {donation.warehouse_name && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated by: {donation.warehouse_name}
                    {donation.warehouse_updated_at && (
                      <span>
                        {" "}
                        •{" "}
                        {new Date(
                          donation.warehouse_updated_at
                        ).toLocaleString()}
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Requested by: {donation.acceptor_name}
              </div>
              {donation.status === "open" && (
                <button
                  onClick={() => handleClaimDonation(donation.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  Claim Donation
                </button>
              )}
              {donation.status === "claimed" &&
                donation.donor_id === user.id && (
                  <button
                    onClick={() => handleConfirmDonation(donation.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Confirm Donation
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DonorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Donor Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.user_metadata?.name || "Donor"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Show notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-md ${
              notification.type === "new"
                ? "bg-blue-50 border border-blue-200 text-blue-700"
                : notification.type === "confirmed"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-yellow-50 border border-yellow-200 text-yellow-700"
            }`}
          >
            <p className="font-medium">{notification.message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Tab buttons */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8">
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "available"
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setActiveTab("claimed")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "claimed"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Claimed
          </button>
          <button
            onClick={() => setActiveTab("in_process")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "in_process"
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            In Process
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "completed"
                ? "bg-gray-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Render tab content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
