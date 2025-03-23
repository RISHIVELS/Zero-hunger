import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createDonationRequest } from "../../services/supabase";

const foodTypes = [
  "Cooked Food",
  "Raw Vegetables",
  "Fruits",
  "Grains",
  "Dairy",
  "Bakery Items",
  "Canned Food",
  "Others",
];

const exertionTypes = [
  "Religious Institution",
  "Homeless Shelter",
  "Food Bank",
  "Community Center",
  "School",
  "Orphanage",
  "Senior Care",
  "Disaster Relief",
  "Others",
];

const RequestDonation = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    foodType: "",
    exertionType: "",
    quantity: "",
    expiryDate: "",
    location: "",
    contact: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const donationData = {
        title: formData.title,
        description: formData.description,
        food_type: formData.foodType,
        exertion_type: formData.exertionType,
        quantity: formData.quantity,
        expiry_date: formData.expiryDate,
        location: formData.location,
        contact: formData.contact,
        acceptor_id: user.id,
        acceptor_name: user.user_metadata?.name || "Anonymous",
        status: "open",
        created_at: new Date().toISOString(),
      };

      const { data, error } = await createDonationRequest(donationData);
      if (error) throw error;

      // Reset form and notify parent component of success
      setFormData({
        title: "",
        description: "",
        foodType: "",
        exertionType: "",
        quantity: "",
        expiryDate: "",
        location: "",
        contact: "",
      });

      onSuccess(data[0]);
    } catch (err) {
      console.error("Error creating donation request:", err);
      setError(err.message || "Failed to create donation request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-8 text-white">
        <h2 className="text-3xl font-light tracking-wide">
          Create Donation Request
        </h2>
        <p className="text-purple-200 mt-2 opacity-80">
          Fill in the details to create a food donation request
        </p>
      </div>

      {/* Content */}
      <div className="p-8">
        {error && (
          <div className="mb-8 bg-red-900/20 border-l-4 border-red-700 text-red-200 p-4 rounded-r-md">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm border border-slate-700/50">
            <h3 className="text-white text-xl font-medium mb-4 pb-2 border-b border-slate-700">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="title"
                  className="text-slate-300 block mb-2 text-sm font-medium"
                >
                  Donation Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="E.g., Food for homeless shelter"
                />
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="text-slate-300 block mb-2 text-sm font-medium"
                >
                  Quantity Needed
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="text"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="E.g., 10 meals, 5kg, etc."
                />
              </div>
            </div>
          </div>

          {/* Food Details Card */}
          <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm border border-slate-700/50">
            <h3 className="text-white text-xl font-medium mb-4 pb-2 border-b border-slate-700">
              Food Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="foodType"
                  className="text-slate-300 block mb-2 text-sm font-medium"
                >
                  Food Type
                </label>
                <select
                  id="foodType"
                  name="foodType"
                  required
                  value={formData.foodType}
                  onChange={handleChange}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Food Type</option>
                  {foodTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="exertionType"
                  className="text-slate-300 block mb-2 text-sm font-medium"
                >
                  Religious Exertion Type
                </label>
                <select
                  id="exertionType"
                  name="exertionType"
                  required
                  value={formData.exertionType}
                  onChange={handleChange}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Exertion Type</option>
                  {exertionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="expiryDate"
                  className="text-slate-300 block mb-2 text-sm font-medium"
                >
                  Required Before Date
                </label>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="text-slate-300 block mb-2 text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Provide details about your donation request"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm border border-slate-700/50">
            <h3 className="text-white text-xl font-medium mb-4 pb-2 border-b border-slate-700">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="location"
                  className="text-slate-300 block mb-2 text-sm font-medium"
                >
                  Pickup Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Full address for pickup"
                />
              </div>

              <div>
                <label
                  htmlFor="contact"
                  className="text-slate-300 block mb-2 text-sm font-medium"
                >
                  Contact Information
                </label>
                <input
                  id="contact"
                  name="contact"
                  type="text"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Phone number or email for contact"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-medium py-3 px-8 min-w-[200px] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50 transition-all duration-300 disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                ) : (
                  "Submit Request"
                )}
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 group-hover:opacity-100 opacity-70"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestDonation;
