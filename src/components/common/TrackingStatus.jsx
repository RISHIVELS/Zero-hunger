import React from "react";

const TrackingStatus = ({ currentStatus }) => {
  // Define the possible tracking stages in order
  const stages = ["confirmed", "pending", "in_transit", "delivered"];

  // Find the current stage index
  const currentStageIndex = stages.indexOf(currentStatus);

  // Handle cancelled status specially
  if (currentStatus === "cancelled") {
    return (
      <div className="mt-3">
        <div className="relative">
          <div className="w-full h-2 bg-gray-200 rounded">
            <div className="absolute w-full h-2 bg-red-200 rounded"></div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Cancelled</span>
            <span className="text-red-500 font-medium">Donation Cancelled</span>
          </div>
        </div>
      </div>
    );
  }

  // Regular tracking status display
  return (
    <div className="mt-3">
      <div className="relative">
        <div className="w-full h-2 bg-gray-200 rounded">
          {/* Active progress bar */}
          {currentStageIndex >= 0 && (
            <div
              className="absolute h-2 bg-blue-500 rounded"
              style={{
                width: `${((currentStageIndex + 1) / stages.length) * 100}%`,
                transition: "width 0.5s ease-in-out",
              }}
            ></div>
          )}

          {/* Stage dots */}
          <div className="absolute top-0 left-0 w-full flex justify-between transform -translate-y-1/2">
            {stages.map((stage, index) => (
              <div
                key={stage}
                className={`w-4 h-4 rounded-full ${
                  index <= currentStageIndex
                    ? "bg-blue-500 border-2 border-white"
                    : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Stage labels */}
        <div className="mt-2 flex justify-between text-xs">
          {stages.map((stage, index) => (
            <div
              key={stage}
              className={`text-center w-1/4 ${
                index <= currentStageIndex
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {stage.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackingStatus;
