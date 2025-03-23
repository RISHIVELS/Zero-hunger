import { useState } from "react";
import { Link } from "react-router-dom";

const DonorSidebar = ({ activeTab, setActiveTab, logout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const tabs = [
    {
      id: "available",
      label: "Available Donations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      ),
    },
    {
      id: "claimed",
      label: "My Claimed Donations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      ),
    },
    {
      id: "confirmed",
      label: "Confirmed Donations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
    },
    {
      id: "stats",
      label: "Donation Statistics",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
          <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`bg-slate-800 text-white shadow-xl transition-all duration-500 ease-in-out ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <h2
          className={`text-2xl font-bold text-white transition-opacity duration-300 ${
            collapsed ? "hidden" : "block"
          }`}
        >
          Zero Hunger
        </h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white p-2 rounded-full hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)" }}
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <nav className="p-4 mt-6">
        <ul className="space-y-4">
          {tabs.map((tab) => (
            <li key={tab.id} className="relative">
              <button
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setHoveredItem(tab.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center p-4 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-white hover:bg-slate-700"
                }`}
                aria-label={tab.label}
              >
                <span
                  className={`transition-transform duration-300 ${
                    activeTab === tab.id ? "transform scale-110" : ""
                  }`}
                >
                  {tab.icon}
                </span>
                <span
                  className={`ml-4 font-medium text-lg tracking-wide transition-opacity duration-300 ${
                    collapsed ? "hidden" : "block"
                  }`}
                >
                  {tab.label}
                </span>
              </button>

              {/* Tooltip for collapsed state */}
              {collapsed && hoveredItem === tab.id && (
                <div className="absolute left-full top-0 ml-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-md shadow-xl whitespace-nowrap z-50">
                  {tab.label}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full border-t border-slate-700 p-4">
        {/* Home button */}
        <Link
          to="/"
          onMouseEnter={() => setHoveredItem("home")}
          onMouseLeave={() => setHoveredItem(null)}
          className={`text-white flex items-center p-0 rounded-lg transition-all duration-300 mb-3 ${
            collapsed ? "justify-center w-full" : "w-full"
          }`}
          aria-label="Go to Home"
        >
          <div className="flex items-center px-4 py-3 rounded-lg hover:bg-green-600 transition-all duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span
              className={`ml-4 text-lg font-medium transition-opacity duration-300 ${
                collapsed ? "hidden" : "block"
              }`}
            >
              Home
            </span>
          </div>

          {/* Tooltip for home in collapsed state */}
          {collapsed && hoveredItem === "home" && (
            <div className="absolute left-full bottom-0 mb-16 ml-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-md shadow-xl z-50">
              Go to Home
            </div>
          )}
        </Link>

        {/* Logout button */}
        <button
          onClick={logout}
          onMouseEnter={() => setHoveredItem("logout")}
          onMouseLeave={() => setHoveredItem(null)}
          className={`text-white flex items-center p-0 rounded-lg transition-all duration-300 ${
            collapsed ? "justify-center w-full" : "w-full"
          }`}
          aria-label="Logout"
        >
          <div className="flex items-center px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span
              className={`ml-4 text-lg font-medium transition-opacity duration-300 ${
                collapsed ? "hidden" : "block"
              }`}
            >
              Logout
            </span>
          </div>

          {/* Tooltip for logout in collapsed state */}
          {collapsed && hoveredItem === "logout" && (
            <div className="absolute left-full bottom-0 mb-4 ml-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-md shadow-xl z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default DonorSidebar;
