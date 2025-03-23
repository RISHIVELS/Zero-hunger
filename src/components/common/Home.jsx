import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Home = () => {
  const { user, isAcceptor, isDonor } = useAuth();
  const [isChatbotOpen, setChatbotOpen] = useState(false);

  // Determine where to redirect authenticated users
  const getDashboardLink = () => {
    if (user) {
      if (isAcceptor) return "/acceptor/dashboard";
      if (isDonor) return "/donor/dashboard";
    }
    return "/login";
  };

  const toggleChatbot = () => {
    setChatbotOpen(!isChatbotOpen);
  };

  // Chart data
  const chartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Meals Donated",
        data: [1200, 1900, 2300, 2800, 3200, 3700],
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
      {
        label: "Food Requests",
        data: [1500, 2100, 2500, 3000, 3500, 4000],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
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
            size: 14,
            weight: "bold",
          },
          usePointStyle: true,
          padding: 20,
          color: "#4b5563",
        },
      },
      title: {
        display: true,
        text: "Donation Activity in 2023",
        font: {
          size: 18,
          weight: "bold",
        },
        color: "#1f2937",
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Meals",
          font: {
            size: 14,
            weight: "bold",
          },
          color: "#4b5563",
        },
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#4b5563",
        },
      },
      x: {
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#4b5563",
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600">
                Zero Hunger
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to={getDashboardLink()}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-md text-green-600 hover:text-green-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Fighting hunger, one donation at a time
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Zero Hunger connects food donors with religious institutions and
                community centers to reduce food waste and fight hunger in our
                communities.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="px-4 py-2 rounded-md border text-green-600 font-medium hover:bg-green-700 hover:text-white transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="People sharing food"
                className="rounded-lg shadow-md max-h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics Section */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Impact</h2>
          <p
            className="text-center text-gray-600 mb-8 mx-auto"
            style={{ maxWidth: "800px" }}
          >
            Together we're making a difference in communities by reducing food
            waste and ensuring those in need have access to nutritious meals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md transition-all">
              <div className="text-4xl font-bold text-green-600 mb-2">
                10,000+
              </div>
              <div className="text-gray-700 font-medium">Meals Donated</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md transition-all">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-700 font-medium">
                Religious Institutions
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md transition-all">
              <div className="text-4xl font-bold text-green-600 mb-2">250+</div>
              <div className="text-gray-700 font-medium">Active Donors</div>
            </div>
          </div>

          {/* Donations Chart */}
          <div className="rounded-lg p-6 mx-auto max-w-4xl">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Monthly Donation Activity
            </h3>
            <div className="h-96">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Acceptors */}
            <div className="bg-gradient-to-b from-green-50 to-white p-6 rounded-lg shadow-md transition-all">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Acceptors</h3>
              <p className="text-gray-600">
                Register as an acceptor, request food donations for your
                religious institution, and connect with generous donors in your
                community.
              </p>
            </div>

            {/* For Donors */}
            <div className="bg-gradient-to-b from-blue-50 to-white p-6 rounded-lg shadow-md transition-all">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Donors</h3>
              <p className="text-gray-600">
                Sign up as a donor, browse food donation requests, and
                contribute to reducing hunger in your local community.
              </p>
            </div>

            {/* Real-time Updates */}
            <div className="bg-gradient-to-b from-blue-50 to-white p-6 rounded-lg shadow-md transition-all">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant notifications about new donation requests and track
                the status of your contributions in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Success Stories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4 text-green-600 flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                "Zero Hunger has transformed how our mosque supports the local
                community. We can now ensure that families in need receive
                regular, nutritious food donations. The platform is easy to use
                and has connected us with incredible donors."
              </p>
              <div className="font-medium">
                <p className="text-gray-700">Ahmad Khaled</p>
                <p className="text-gray-600">Al-Noor Mosque</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4 text-green-600 flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                "As a restaurant owner, I was always concerned about food waste.
                Zero Hunger has given us a reliable channel to donate excess
                food to those who need it most. The real-time notifications and
                easy scheduling make the process seamless."
              </p>
              <div className="font-medium">
                <p className="text-gray-700">Sarah Johnson</p>
                <p className="text-gray-600">Fresh Bites Restaurant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Movement Today</h2>
          <p className="text-xl mb-8 mx-auto" style={{ maxWidth: "800px" }}>
            Whether you're a religious institution looking for support or a
            donor ready to make a difference, Zero Hunger provides the platform
            to connect and create impact.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-4 py-2 rounded-md bg-white text-green-600 font-medium hover:bg-green-700 hover:text-white transition-colors"
            >
              Sign Up Now
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 rounded-md border text-white font-medium hover:bg-green-700 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-lg font-semibold mb-4">Zero Hunger</h3>
              <p className="text-gray-400">
                Connecting donors with religious institutions and community
                centers to combat hunger and reduce food waste.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-gray-400 hover:text-white"
                  >
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">
                Have questions or suggestions? <br />
                <a
                  href="mailto:info@zerohunger.org"
                  className="text-green-600 hover:text-green-700"
                >
                  info@zerohunger.org
                </a>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Zero Hunger. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        {/* Chatbot Button */}
        <button
          onClick={toggleChatbot}
          className="bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all mb-2"
        >
          {isChatbotOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          )}
        </button>

        {/* Chatbot Container */}
        {isChatbotOpen && (
          <div className="w-96 h-[500px] bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out">
            <iframe
              src="https://www.chatbase.co/chatbot-iframe/1H09D5k-YNNKBH-gp7htX"
              width="100%"
              style={{ height: "100%", minHeight: "500px" }}
              frameBorder="0"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
