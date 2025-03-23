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
        if (
          error.message &&
          error.message.includes("not found or not available")
        ) {
          setActionError(
            "This donation is no longer available. It may have been claimed by someone else."
          );
        } else if (error.code === "PGRST116") {
          setActionError(
            "You don't have permission to claim this donation. Please try again or contact support."
          );
        } else if (error.code === "42501") {
          setActionError(
            "Permission denied. Please try logging out and logging back in."
          );
        } else {
          setActionError("Failed to claim donation. Please try again later.");
        }
        throw error;
      }

      if (onUpdate) onUpdate(data[0]);
    } catch (err) {
      console.error("Error claiming donation:", err);
      if (!actionError) {
        setActionError("Failed to claim donation. Please try again.");
      }
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
                  className="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg hover:from-green-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center">
                    {processingId === donation.id ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z"></path>
                          <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
                        </svg>
                        Claim Donation
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-white/20 transform -skew-x-12 -translate-x-full hover:translate-x-0 transition-transform ease-out duration-500"></div>
                </button>
              )}

              {userType === "donor" &&
                donation.status === "claimed" &&
                donation.donor_id === user.id && (
                  <button
                    onClick={() => handleConfirm(donation.id)}
                    disabled={processingId === donation.id}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center">
                      {processingId === donation.id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          Confirm Pickup
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-white/20 transform -skew-x-12 -translate-x-full hover:translate-x-0 transition-transform ease-out duration-500"></div>
                  </button>
                )}

              {userType === "acceptor" && donation.status === "claimed" && (
                <div className="space-x-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusUpdate(donation.id, "completed")}
                    disabled={processingId === donation.id}
                    className="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg hover:from-green-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center">
                      {processingId === donation.id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          Mark as Completed
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-white/20 transform -skew-x-12 -translate-x-full hover:translate-x-0 transition-transform ease-out duration-500"></div>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(donation.id, "cancelled")}
                    disabled={processingId === donation.id}
                    className="relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center">
                      {processingId === donation.id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          Cancel
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-white/20 transform -skew-x-12 -translate-x-full hover:translate-x-0 transition-transform ease-out duration-500"></div>
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
