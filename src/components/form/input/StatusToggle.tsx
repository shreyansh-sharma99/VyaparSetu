import React from "react";

interface StatusToggleProps {
  status: string;
  onStatusChange: (status: string) => void;
  activeLabel?: string;
  inactiveLabel?: string;
  activeValue?: string;
  inactiveValue?: string;
}

const StatusToggle: React.FC<StatusToggleProps> = ({
  status,
  onStatusChange,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  activeValue = "active",
  inactiveValue = "inactive",
}) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
      <button
        onClick={() => onStatusChange(activeValue)}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${status === activeValue
          ? "bg-white dark:bg-blue-600 shadow-sm text-blue-600 dark:text-white"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
      >
        {activeLabel}
      </button>
      <button
        onClick={() => onStatusChange(inactiveValue)}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${status === inactiveValue
          ? "bg-white dark:bg-blue-600 shadow-sm text-blue-600 dark:text-white"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
      >
        {inactiveLabel}
      </button>
    </div>
  );
};

export default StatusToggle;
