import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAcceptorDonations,
  subscribeToUpdatedDonations,
  subscribeToUserNotifications,
} from "../../services/supabase";
import AcceptorSidebar from "./AcceptorSidebar";
import RequestDonation from "./RequestDonation";
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
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AcceptorDashboard = () => {
  const { user, logout } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("donations");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    confirmed: 0,
    claimed: 0,
    open: 0,
    monthlyRequests: [0, 0, 0, 0, 0, 0],
  });

  useEffect(() => {
    if (!user) return;

    const fetchDonations = async () => {
      try {
        const { data, error } = await getAcceptorDonations(user.id);
        if (error) throw error;
        setDonations(data || []);

        // Calculate statistics
        if (data && data.length > 0) {
          const confirmed = data.filter((d) => d.status === "confirmed").length;
          const claimed = data.filter((d) => d.status === "claimed").length;
          const open = data.filter((d) => d.status === "open").length;

          // Calculate monthly data (mock data for demonstration)
          // In a real app, you would parse the created_at dates and group by month
          const monthlyData = [
            Math.floor(Math.random() * 10) + 1,
            Math.floor(Math.random() * 10) + 1,
            Math.floor(Math.random() * 10) + 5,
            Math.floor(Math.random() * 10) + 5,
            Math.floor(Math.random() * 10) + 7,
            data.length, // Current month (total)
          ];

          setStats({
            totalRequests: data.length,
            confirmed,
            claimed,
            open,
            monthlyRequests: monthlyData,
          });
        }
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

  // Pie chart data for donation status
  const statusChartData = {
    labels: ["Confirmed", "Claimed", "Open"],
    datasets: [
      {
        data: [stats.confirmed, stats.claimed, stats.open],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // Green for confirmed
          "rgba(59, 130, 246, 0.8)", // Blue for claimed
          "rgba(234, 179, 8, 0.8)", // Yellow for open
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(234, 179, 8, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data for monthly requests
  const monthlyChartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Donation Requests",
        data: stats.monthlyRequests,
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

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
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: "bold",
        },
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
          text: "Number of Requests",
          font: {
            size: 12,
            weight: "bold",
          },
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

  const handleDonationSuccess = (newDonation) => {
    setDonations((prev) => [newDonation, ...prev]);
    setActiveTab("donations");

    // Update stats when a new donation is added
    setStats((prev) => ({
      ...prev,
      totalRequests: prev.totalRequests + 1,
      open: prev.open + 1,
    }));
  };

  const handleDonationUpdate = (updatedDonation) => {
    const oldDonation = donations.find((d) => d.id === updatedDonation.id);

    setDonations((prev) =>
      prev.map((donation) =>
        donation.id === updatedDonation.id ? updatedDonation : donation
      )
    );

    // Update stats when a donation status changes
    if (oldDonation && oldDonation.status !== updatedDonation.status) {
      setStats((prev) => {
        const newStats = { ...prev };

        // Decrement the old status count
        if (oldDonation.status === "confirmed") newStats.confirmed--;
        else if (oldDonation.status === "claimed") newStats.claimed--;
        else if (oldDonation.status === "open") newStats.open--;

        // Increment the new status count
        if (updatedDonation.status === "confirmed") newStats.confirmed++;
        else if (updatedDonation.status === "claimed") newStats.claimed++;
        else if (updatedDonation.status === "open") newStats.open++;

        return newStats;
      });
    }
  };

  const renderTabContent = () => {
    if (activeTab === "stats") {
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">Total Requests</h3>
              <p className="text-4xl font-bold">{stats.totalRequests}</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">Confirmed</h3>
              <p className="text-4xl font-bold">{stats.confirmed}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">Claimed</h3>
              <p className="text-4xl font-bold">{stats.claimed}</p>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">Open</h3>
              <p className="text-4xl font-bold">{stats.open}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Donation Status
              </h3>
              <div className="h-64">
                <Pie data={statusChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 transition-all">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Monthly Requests
              </h3>
              <div className="h-64">
                <Bar data={monthlyChartData} options={barChartOptions} />
              </div>
            </div>
          </div>
        </div>
      );
    } else if (activeTab === "request") {
      return <RequestDonation onSuccess={handleDonationSuccess} />;
    } else {
      // Filter donations based on the active tab
      const filteredDonations = donations.filter((donation) => {
        switch (activeTab) {
          case "open":
            return donation.status === "open";
          case "claimed":
            return donation.status === "claimed";
          case "in_process":
            return ["confirmed", "pending", "in_transit"].includes(
              donation.status
            );
          case "completed":
            return ["delivered", "cancelled"].includes(donation.status);
          default:
            return true; // "all" tab shows everything
        }
      });

      if (filteredDonations.length === 0) {
        return (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">
              {activeTab === "open"
                ? "No open donation requests"
                : activeTab === "claimed"
                ? "No claimed donations"
                : activeTab === "in_process"
                ? "No donations in process"
                : activeTab === "completed"
                ? "No completed donations"
                : "No donations found"}
            </p>
            {activeTab === "open" && (
              <button
                onClick={() => setActiveTab("request")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create a Request
              </button>
            )}
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
                        : donation.status === "confirmed"
                        ? "bg-purple-100 text-purple-800"
                        : donation.status === "pending"
                        ? "bg-indigo-100 text-indigo-800"
                        : donation.status === "in_transit"
                        ? "bg-purple-100 text-purple-800"
                        : donation.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {donation.status === "open"
                      ? "Open"
                      : donation.status === "claimed"
                      ? "Claimed"
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
                  <p className="font-medium text-gray-800">
                    {donation.quantity}
                  </p>
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
                  Created: {new Date(donation.created_at).toLocaleDateString()}
                </div>
                {donation.donor_name && (
                  <div className="text-sm text-gray-500">
                    Donor: {donation.donor_name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AcceptorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Acceptor Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.user_metadata?.name || "Acceptor"}
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
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
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
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-gray-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setActiveTab("open")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "open"
                ? "bg-yellow-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Open
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
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab("request")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "request"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            New Request
          </button>
        </div>

        {/* Render tab content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default AcceptorDashboard;
