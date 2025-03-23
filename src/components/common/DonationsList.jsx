import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  claimDonation,
  updateDonationStatus,
  confirmDonation,
} from "../../services/supabase";

const DonationsList = ({ donations, loading, error, userType, onUpdate }) => {
  const { user } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [actionError, setActionError] = useState("");

  // Status colors and labels
  const statusConfig = {
    open: { color: "bg-blue-100 text-blue-800", label: "Open" },
    claimed: { color: "bg-yellow-100 text-yellow-800", label: "Claimed" },
    confirmed: { color: "bg-green-100 text-green-800", label: "Confirmed" },
    completed: { color: "bg-green-100 text-green-800", label: "Completed" },
    cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
  };

  // Format date string to readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleClaim = async (donationId) => {
    setProcessingId(donationId);
    setActionError("");

    console.log("Claiming donation:", donationId);
    console.log("Current user:", user);

    try {
      const { data, error } = await claimDonation(
        donationId,
        user.id,
        user.user_metadata?.name || "Anonymous"
      );

      console.log("Claim response data:", data);
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (onUpdate) onUpdate(data[0]);
    } catch (err) {
      console.error("Error claiming donation:", err);
      setActionError("Failed to claim donation. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirm = async (donationId) => {
    setProcessingId(donationId);
    setActionError("");

    try {
      const { data, error } = await confirmDonation(donationId);
      if (error) throw error;

      if (onUpdate) onUpdate(data[0]);
    } catch (err) {
      console.error("Error confirming donation:", err);
      setActionError("Failed to confirm donation. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusUpdate = async (donationId, status) => {
    setProcessingId(donationId);
    setActionError("");

    try {
      const { data, error } = await updateDonationStatus(donationId, status);
      if (error) throw error;

      if (onUpdate) onUpdate(data[0]);
    } catch (err) {
      console.error("Error updating status:", err);
      setActionError("Failed to update status. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No donations found
        </h3>
        <p className="mt-1 text-gray-500">
          {userType === "acceptor"
            ? "You have not requested any donations yet."
            : "There are no donation requests at the moment."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {userType === "acceptor"
          ? "My Donation Requests"
          : "Available Donation Requests"}
      </h2>

      {actionError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {actionError}
        </div>
      )}

      <div className="space-y-4">
        {donations.map((donation) => (
          <div
            key={donation.id}
            className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex flex-wrap justify-between items-start">
              <div className="mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {donation.title}
                </h3>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    statusConfig[donation.status]?.color || "bg-gray-100"
                  }`}
                >
                  {statusConfig[donation.status]?.label || donation.status}
                </span>
              </div>

              {userType === "donor" && donation.status === "open" && (
                <button
                  onClick={() => handleClaim(donation.id)}
                  disabled={processingId === donation.id}
                  className="bg-green-600 text-white text-sm py-1 px-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
                >
                  {processingId === donation.id
                    ? "Processing..."
                    : "Claim Donation"}
                </button>
              )}

              {userType === "donor" &&
                donation.status === "claimed" &&
                donation.donor_id === user.id && (
                  <button
                    onClick={() => handleConfirm(donation.id)}
                    disabled={processingId === donation.id}
                    className="bg-blue-600 text-white text-sm py-1 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
                  >
                    {processingId === donation.id
                      ? "Processing..."
                      : "Confirm Pickup"}
                  </button>
                )}

              {userType === "acceptor" && donation.status === "claimed" && (
                <div className="space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(donation.id, "completed")}
                    disabled={processingId === donation.id}
                    className="bg-green-600 text-white text-sm py-1 px-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
                  >
                    {processingId === donation.id
                      ? "Processing..."
                      : "Mark as Completed"}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(donation.id, "cancelled")}
                    disabled={processingId === donation.id}
                    className="bg-red-600 text-white text-sm py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
                  >
                    {processingId === donation.id ? "Processing..." : "Cancel"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-500">Food Type:</span>{" "}
                {donation.food_type}
              </div>
              <div>
                <span className="font-medium text-gray-500">Quantity:</span>{" "}
                {donation.quantity}
              </div>
              <div>
                <span className="font-medium text-gray-500">
                  Exertion Type:
                </span>{" "}
                {donation.exertion_type}
              </div>
              <div>
                <span className="font-medium text-gray-500">
                  Required Before:
                </span>{" "}
                {formatDate(donation.expiry_date)}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-500">Location:</span>{" "}
                {donation.location}
              </div>
              {userType === "donor" &&
                donation.status === "claimed" &&
                donation.donor_id === user.id && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-500">Contact:</span>{" "}
                    {donation.contact}
                  </div>
                )}
            </div>

            <div className="mt-3">
              <p className="text-gray-700">{donation.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
              <div>
                {userType === "donor" ? (
                  <span>Requested by: {donation.acceptor_name}</span>
                ) : donation.donor_id ? (
                  <span>Claimed by: {donation.donor_name || "Anonymous"}</span>
                ) : null}
              </div>
              <div>
                <span>Posted: {formatDate(donation.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationsList;
