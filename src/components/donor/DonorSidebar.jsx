import { useState } from "react";

const DonorSidebar = ({ activeTab, setActiveTab, logout }) => {
  const [collapsed, setCollapsed] = useState(false);

  const tabs = [
    { id: "available", label: "Available Donations", icon: "📋" },
    { id: "claimed", label: "My Claimed Donations", icon: "🔔" },
    { id: "confirmed", label: "Confirmed Donations", icon: "✅" },
  ];

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2
          className={`font-bold text-green-600 truncate ${
            collapsed ? "hidden" : "block"
          }`}
        >
          Zero Hunger
        </h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="p-2">
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center p-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-green-100 text-green-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span
                  className={`ml-3 truncate ${collapsed ? "hidden" : "block"}`}
                >
                  {tab.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
        <button
          onClick={logout}
          className={`text-red-600 flex items-center hover:text-red-800 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="text-xl">🚪</span>
          <span className={`ml-3 ${collapsed ? "hidden" : "block"}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default DonorSidebar;
