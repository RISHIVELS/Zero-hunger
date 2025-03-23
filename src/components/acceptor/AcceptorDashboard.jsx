import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAcceptorDonations,
  subscribeToUpdatedDonations,
} from "../../services/supabase";
import AcceptorSidebar from "./AcceptorSidebar";
import RequestDonation from "./RequestDonation";
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
      case "stats":
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
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AcceptorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logout={logout}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {notification && (
          <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg shadow-md animate-fade-in-out transition-opacity">
            <strong className="font-bold">Donation Confirmed! </strong>
            <span className="block sm:inline">{notification.message}</span>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            Acceptor Dashboard
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

export default AcceptorDashboard;
