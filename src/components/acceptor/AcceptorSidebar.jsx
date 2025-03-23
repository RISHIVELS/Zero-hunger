import { useState } from "react";
import { Link } from "react-router-dom";

const AcceptorSidebar = ({ activeTab, setActiveTab, logout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      id: "donations",
      label: "My Donations",
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
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
    },
    {
      id: "request",
      label: "Request Donation",
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
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
    },
    {
      id: "stats",
      label: "Statistics",
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
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`bg-slate-800 text-white shadow-xl transition-all duration-500 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="p-6 flex items-center justify-between border-b border-slate-700">
        {!isCollapsed && (
          <h2 className="text-2xl font-bold text-white">Zero Hunger</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="text-white p-2 rounded-full hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
            style={{
              transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            {isCollapsed ? (
              <polyline points="9 18 15 12 9 6"></polyline>
            ) : (
              <polyline points="15 18 9 12 15 6"></polyline>
            )}
          </svg>
        </button>
      </div>

      <nav className="mt-8">
        <ul className="space-y-4 px-4">
          {menuItems.map((item) => (
            <li key={item.id} className="relative">
              <button
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`flex items-center w-full p-4 rounded-lg transition-all duration-300 
                ${
                  activeTab === item.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-white hover:bg-slate-700"
                } 
                ${isCollapsed ? "justify-center" : "px-6"}`}
                aria-label={item.label}
              >
                <span
                  className={`flex-shrink-0 transition-all duration-300 ${
                    activeTab === item.id ? "transform scale-110" : ""
                  }`}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="ml-4 font-medium text-lg tracking-wide transition-all duration-300">
                    {item.label}
                  </span>
                )}
              </button>

              {/* Tooltip for collapsed state */}
              {isCollapsed && hoveredItem === item.id && (
                <div className="absolute left-full top-0 ml-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-md shadow-xl whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
        {/* Home button */}
        <Link
          to="/"
          onMouseEnter={() => setHoveredItem("home")}
          onMouseLeave={() => setHoveredItem(null)}
          className={`flex items-center text-white p-0 rounded-lg transition-all duration-300 mb-3 ${
            isCollapsed ? "justify-center w-full" : "w-full"
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
            {!isCollapsed && (
              <span className="ml-4 text-lg font-medium">Home</span>
            )}
          </div>

          {/* Tooltip for home in collapsed state */}
          {isCollapsed && hoveredItem === "home" && (
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
          className={`flex items-center text-white p-0 rounded-lg transition-all duration-300 ${
            isCollapsed ? "justify-center w-full" : "w-full"
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
            {!isCollapsed && (
              <span className="ml-4 text-lg font-medium">Logout</span>
            )}
          </div>

          {/* Tooltip for logout in collapsed state */}
          {isCollapsed && hoveredItem === "logout" && (
            <div className="absolute left-full bottom-0 mb-4 ml-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-md shadow-xl z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AcceptorSidebar;
