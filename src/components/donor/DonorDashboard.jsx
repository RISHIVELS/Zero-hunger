import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getDonationRequests,
  subscribeToNewDonations,
  subscribeToUpdatedDonations,
} from "../../services/supabase";
import DonorSidebar from "./DonorSidebar";
import DonationsList from "../common/DonationsList";
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
    } else if (activeTab === "stats") {
      return false; // Don't show donations in stats tab
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

  const renderTabContent = () => {
    if (activeTab === "stats") {
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">Available Requests</h3>
              <p className="text-4xl font-bold">{stats.totalAvailable}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">Your Claimed</h3>
              <p className="text-4xl font-bold">{stats.claimed}</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">Your Confirmed</h3>
              <p className="text-4xl font-bold">{stats.confirmed}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Donation Status
              </h3>
              <div className="h-64">
                <Doughnut data={statusChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 transition-all">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Monthly Donations
              </h3>
              <div className="h-64">
                <Bar data={monthlyChartData} options={barChartOptions} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transition-all">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Donation Categories
            </h3>
            <div className="h-64 max-w-md mx-auto">
              <PolarArea data={categoryChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <DonationsList
          donations={filteredDonations}
          loading={loading}
          error={error}
          userType="donor"
          onUpdate={handleDonationUpdate}
        />
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
            } px-4 py-3 rounded-lg shadow-md animate-fade-in-out transition-opacity border`}
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
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            Donor Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome, {user?.user_metadata?.name || "User"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default DonorDashboard;
