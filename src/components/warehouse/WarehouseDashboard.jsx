import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getWarehouseRequests,
  updateDonationTracking,
  subscribeToWarehouseRequests,
} from "../../services/supabase";
import TrackingStatus from "../common/TrackingStatus";
import NotificationCenter from "../common/NotificationCenter";

const WarehouseDashboard = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [inProcessRequests, setInProcessRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWarehouseRequests();

    // Subscribe to real-time updates
    const subscription = subscribeToWarehouseRequests((payload) => {
      // Reload requests when there's a change
      loadWarehouseRequests();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadWarehouseRequests = async () => {
    setLoading(true);
    try {
      // Get all warehouse requests
      const { data, error } = await getWarehouseRequests();
      if (error) throw error;

      if (data) {
        // Filter requests based on status
        const pending = data.filter(
          (req) =>
            req.status === "pending" &&
            req.donation_requests &&
            req.donation_requests.status === "confirmed"
        );

        const inProcess = data.filter(
          (req) =>
            req.status === "pending" &&
            req.donation_requests &&
            ["pending", "in_transit"].includes(req.donation_requests.status)
        );

        const completed = data.filter(
          (req) =>
            req.status !== "pending" ||
            (req.donation_requests &&
              ["delivered", "cancelled"].includes(req.donation_requests.status))
        );

        setPendingRequests(pending);
        setInProcessRequests(inProcess);
        setCompletedRequests(completed);
      }
    } catch (err) {
      console.error("Error loading warehouse requests:", err);
      setError("Failed to load warehouse requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async (donationId, newStatus) => {
    try {
      const { data, error } = await updateDonationTracking(
        donationId,
        newStatus,
        user.id,
        user.user_metadata?.name || "Warehouse Staff"
      );

      if (error) throw error;

      // Reload requests after update
      loadWarehouseRequests();
    } catch (err) {
      console.error("Error updating tracking status:", err);
      setError("Failed to update tracking status");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Warehouse Dashboard</h1>
              <p className="opacity-75 mt-1">
                Verify and track donation deliveries
              </p>
            </div>
            <NotificationCenter />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Verification Column */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-sm mr-3">
                  {pendingRequests.length}
                </span>
                Pending Verification
              </h2>
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">
                    No pending requests
                  </p>
                ) : (
                  pendingRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onUpdateTracking={handleUpdateTracking}
                      showControls={true}
                      initialStage="pending"
                    />
                  ))
                )}
              </div>
            </div>

            {/* In Process Column */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm mr-3">
                  {inProcessRequests.length}
                </span>
                In Process
              </h2>
              <div className="space-y-4">
                {inProcessRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">
                    No items in process
                  </p>
                ) : (
                  inProcessRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onUpdateTracking={handleUpdateTracking}
                      showControls={true}
                      initialStage={request.donation_requests.status}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm mr-3">
                  {completedRequests.length}
                </span>
                Completed
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {completedRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">
                    No completed items
                  </p>
                ) : (
                  completedRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onUpdateTracking={handleUpdateTracking}
                      showControls={false}
                      initialStage={request.donation_requests.status}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RequestCard = ({
  request,
  onUpdateTracking,
  showControls = true,
  initialStage,
}) => {
  const donation = request.donation_requests;

  if (!donation) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 truncate">{donation.title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
            donation.status
          )}`}
        >
          {donation.status}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        <p className="mb-1">
          <span className="font-medium text-gray-700">Food Type:</span>{" "}
          {donation.food_type}
        </p>
        <p className="mb-1">
          <span className="font-medium text-gray-700">Quantity:</span>{" "}
          {donation.quantity}
        </p>
        <p className="mb-1">
          <span className="font-medium text-gray-700">Location:</span>{" "}
          {donation.location}
        </p>
        <div className="flex justify-between mt-2">
          <p className="text-xs text-gray-500">
            Donor: {donation.donor_name || "Unknown"}
          </p>
          <p className="text-xs text-gray-500">
            Acceptor: {donation.acceptor_name || "Unknown"}
          </p>
        </div>
      </div>

      <TrackingStatus currentStatus={donation.status} />

      {showControls && (
        <div className="mt-4 flex justify-between gap-2">
          {donation.status === "confirmed" && (
            <>
              <button
                onClick={() => onUpdateTracking(donation.id, "pending")}
                className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-3 rounded text-sm font-medium transition-colors"
              >
                Start Processing
              </button>
              <button
                onClick={() => onUpdateTracking(donation.id, "cancelled")}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 py-2 px-3 rounded text-sm font-medium transition-colors"
              >
                Decline
              </button>
            </>
          )}

          {donation.status === "pending" && (
            <button
              onClick={() => onUpdateTracking(donation.id, "in_transit")}
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-3 rounded text-sm font-medium transition-colors"
            >
              Mark In Transit
            </button>
          )}

          {donation.status === "in_transit" && (
            <button
              onClick={() => onUpdateTracking(donation.id, "delivered")}
              className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-2 px-3 rounded text-sm font-medium transition-colors"
            >
              Mark Delivered
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WarehouseDashboard;
