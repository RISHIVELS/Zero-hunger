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
    <div>
      <h2 className="text-xl font-semibold mb-4">Request a Food Donation</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="title">
              Donation Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="E.g., Food for homeless shelter"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="quantity">
              Quantity Needed *
            </label>
            <input
              id="quantity"
              name="quantity"
              type="text"
              required
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="E.g., 10 meals, 5kg, etc."
            />
          </div>

          {/* Food Type */}
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="foodType">
              Food Type *
            </label>
            <select
              id="foodType"
              name="foodType"
              required
              value={formData.foodType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">Select Food Type</option>
              {foodTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Exertion Type */}
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="exertionType">
              Religious Exertion Type *
            </label>
            <select
              id="exertionType"
              name="exertionType"
              required
              value={formData.exertionType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">Select Exertion Type</option>
              {exertionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="expiryDate">
              Required Before Date *
            </label>
            <input
              id="expiryDate"
              name="expiryDate"
              type="date"
              required
              value={formData.expiryDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="location">
              Pickup Location *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Full address for pickup"
            />
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1" htmlFor="contact">
              Contact Information *
            </label>
            <input
              id="contact"
              name="contact"
              type="text"
              required
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Phone number or email for contact"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1" htmlFor="description">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Provide details about your donation request"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestDonation;
