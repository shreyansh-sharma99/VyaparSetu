import React, { useState } from 'react';

interface TabItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ items, defaultActiveKey, onChange, className = "" }) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || items[0]?.key);

  const handleTabClick = (key: string) => {
    setActiveKey(key);
    if (onChange) onChange(key);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tab bar — horizontal scroll on small screens */}
      <div
        className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl mb-6 overflow-x-auto no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleTabClick(item.key)}
              className={`flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap rounded-lg font-semibold uppercase tracking-wider transition-all duration-300
                px-2.5 py-1.5 text-[10px]
                sm:px-4 sm:py-2 sm:text-[11px]
                md:px-5 md:py-2.5 md:text-xs
                ${isActive
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              {item.icon && (
                <span className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-60'}`}>
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="relative overflow-hidden">
        {items.map((item) => (
          <div
            key={item.key}
            className={`transition-all duration-400 ease-in-out ${
              activeKey === item.key
                ? 'opacity-100 translate-y-0 relative z-10'
                : 'opacity-0 translate-y-2 absolute inset-0 z-0 pointer-events-none'
            }`}
          >
            {item.children}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
