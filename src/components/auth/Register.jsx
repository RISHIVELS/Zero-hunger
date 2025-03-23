import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../../services/supabase";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!formData.role) {
      return setError("Please select a role");
    }

    setLoading(true);

    try {
      // Register with Supabase and include user metadata
      const { data, error } = await signUp(formData.email, formData.password, {
        name: formData.name,
        role: formData.role,
      });

      if (error) throw error;

      // Show a success message and redirect to login
      alert(
        "Registration successful! Please check your email to confirm your account."
      );
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      setError(error.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
          Join Zero Hunger
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="John Doe"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Account Type</label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  formData.role === "acceptor"
                    ? "bg-green-50 border-green-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="acceptor"
                  checked={formData.role === "acceptor"}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="text-center w-full">
                  <div className="font-medium">Acceptor</div>
                  <div className="text-xs text-gray-500">
                    Request food donations
                  </div>
                </div>
              </label>
              <label
                className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  formData.role === "donor"
                    ? "bg-blue-50 border-blue-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="donor"
                  checked={formData.role === "donor"}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="text-center w-full">
                  <div className="font-medium">Donor</div>
                  <div className="text-xs text-gray-500">Donate food</div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:text-green-800">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
