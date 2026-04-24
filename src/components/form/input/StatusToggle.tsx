import React from "react";

interface StatusToggleProps {
  status: string;
  onStatusChange: (status: string) => void;
  activeLabel?: string;
  inactiveLabel?: string;
  allLabel?: string;
  activeValue?: string;
  inactiveValue?: string;
  allValue?: string;
  showAll?: boolean;
}

const StatusToggle: React.FC<StatusToggleProps> = ({
  status,
  onStatusChange,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  allLabel = "All",
  activeValue = "active",
  inactiveValue = "inactive",
  allValue = "all",
  showAll = true,
}) => {
  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-lg h-11">
      {showAll && (
        <button
          onClick={() => onStatusChange(allValue)}
          className={`h-full px-4 rounded-md text-sm font-medium transition-all duration-200 ${status === allValue
            ? "bg-white dark:bg-blue-600 shadow-sm text-blue-600 dark:text-white"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
        >
          {allLabel}
        </button>
      )}
      <button
        onClick={() => onStatusChange(activeValue)}
        className={`h-full px-4 rounded-md text-sm font-medium transition-all duration-200 ${status === activeValue
          ? "bg-white dark:bg-blue-600 shadow-sm text-blue-600 dark:text-white"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
      >
        {activeLabel}
      </button>
      <button
        onClick={() => onStatusChange(inactiveValue)}
        className={`h-full px-4 rounded-md text-sm font-medium transition-all duration-200 ${status === inactiveValue
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

