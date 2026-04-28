import React, { forwardRef } from "react";
import "../../../index.css"
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = "text",
  className = "",
  success = false,
  error = false,
  hint,
  ...rest
}, ref) => {
  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (rest.disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` border-red-500 focus:border-red-300 focus:ring-red-500/20 dark:text-red-400 dark:border-red-500 dark:focus:border-red-800`;
  } else if (success) {
    inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-blue-300 focus:ring-blue-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-blue-800`;
  }

  return (
    <div className="relative">
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        {...rest}
      />
      {hint && (
        <p className={`mt-1.5 text-xs ${error ? "text-red-500" :
          success ? "text-success-500" :
            "text-gray-500"
          }`}>
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
