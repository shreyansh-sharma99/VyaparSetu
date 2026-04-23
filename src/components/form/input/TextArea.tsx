// import React from "react";

// interface TextareaProps {
//   placeholder?: string; // Placeholder text
//   rows?: number; // Number of rows
//   value?: string; // Current value
//   onChange?: (value: string) => void; // Change handler
//   className?: string; // Additional CSS classes
//   disabled?: boolean; // Disabled state
//   error?: boolean; // Error state
//   hint?: string; // Hint text to display
// }

// const TextArea: React.FC<TextareaProps> = ({
//   placeholder = "Enter your message", // Default placeholder
//   rows = 3, // Default number of rows
//   value = "", // Default value
//   onChange, // Callback for changes
//   className = "", // Additional custom styles
//   disabled = false, // Disabled state
//   error = false, // Error state
//   hint = "", // Default hint text
// }) => {
//   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     if (onChange) {
//       onChange(e.target.value);
//     }
//   };

//   let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden ${className} `;

//   if (disabled) {
//     textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed opacity40 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
//   } else if (error) {
//     textareaClasses += ` bg-transparent  border-gray-300 focus:border-error-300 focus:ring-3 focus:ring-error-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-error-800`;
//   } else {
//     textareaClasses += ` bg-transparent text-gray-900 dark:text-gray-300 text-gray-900 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
//   }

//   return (
//     <div className="relative">
//       <textarea
//         placeholder={placeholder}
//         rows={rows}
//         value={value}
//         onChange={handleChange}
//         disabled={disabled}
//         className={textareaClasses}
//       />
//       {hint && (
//         <p
//           className={`mt-2 text-sm ${
//             error ? "text-error-500" : "text-gray-500 dark:text-gray-400"
//           }`}
//         >
//           {hint}
//         </p>
//       )}
//     </div>
//   );
// };

// export default TextArea;

import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;  // Custom error state
  hint?: string;    // Optional helper text
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      placeholder = "Enter your message",
      rows = 3,
      className = "",
      disabled = false,
      error = false,
      hint = "",
      ...rest
    },
    ref
  ) => {
    let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden resize-none ${className} `;

    if (disabled) {
      textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
    } else if (error) {
      textareaClasses += ` border-red-500 focus:border-red-300 focus:ring-3 focus:ring-red-500/20 dark:border-red-500 dark:focus:border-red-800 dark:text-red-400`;
    } else {
      textareaClasses += ` bg-transparent text-gray-900 dark:text-gray-300 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-800`;
    }

    return (
      <div className="relative">
        <textarea
          ref={ref}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={textareaClasses}
          {...rest}
        />
        {hint && (
          <p
            className={`mt-2 text-sm ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"
              }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
