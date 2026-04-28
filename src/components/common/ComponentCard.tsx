import React, { useState } from "react";

interface ComponentCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  rightButtonNode?: React.ReactNode;
  className?: string;
  desc?: string;
  collapsible?: boolean;
  disable?: boolean;
  bodyClassName?: string;
  titleBorder?: boolean;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ 
  title, 
  children, 
  className = "", 
  desc = "", 
  collapsible = false, 
  disable = false, 
  rightButtonNode = null, 
  bodyClassName = "",
  titleBorder = true
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const handleToggle = () => {
    if (collapsible) setIsOpen(!isOpen);
  };

  return (
    <div
      className={`relative rounded-2xl border border-gray-200 bg-white  dark:border-gray-500 dark:bg-white/[0.03] ${className}`}
    >
      {disable && (<div className="absolute inset-0 bg-transparent cursor-not-allowed z-0"></div>)}

      {title && (
        <div className="px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          {/* Left: Title */}
          <div onClick={handleToggle}>
            <h3 className={`text-xl cursor-pointer font-medium inline-block dark:text-white/90 ${titleBorder ? "border-b border-blue-700 text-blue-700" : ""}`}>
              {title}
            </h3>
            {desc && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {desc}
              </p>
            )}
          </div>

          {rightButtonNode && (
            <div className="flex items-center gap-2">
              {rightButtonNode}
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          className={`p-4 sm:px-4 ${title ? "border-t border-gray-200 dark:border-gray-800" : ""
            } ${disable ? "pointer-events-none" : ""} ${bodyClassName}`}
        >
          <div className="space-y-2 h-full flex flex-col">{children}</div>
        </div>
      )}

    </div>
  );
};

export default ComponentCard;
