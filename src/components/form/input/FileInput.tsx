// import { FC } from "react";

// interface FileInputProps {
//   className?: string;
//   onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
//     disabled?: boolean; 
// }

// const FileInput: FC<FileInputProps> = ({ className, onChange ,disabled }) => {
//   return (
//     <input
//       type="file"
//       className={`focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400${disabled ? "opacity-50 cursor-not-allowed" : ""}${className}`}      
//       disabled={disabled} 
//       onChange={onChange}
//     />
//   );
// };

// export default FileInput;

import { FC, useRef } from "react";

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  fileName?: string;
  error?: boolean;
  accept?: string;
}

const truncateFileName = (name: string, maxLength = 25) => {
  if (name.length <= maxLength) return name;

  const extIndex = name.lastIndexOf(".");
  const extension = extIndex !== -1 ? name.substring(extIndex) : "";
  const baseName = extIndex !== -1 ? name.substring(0, extIndex) : name;

  return `${baseName.substring(0, 12)}...${baseName.substring(
    baseName.length - 5
  )}${extension}`;
};

const FileInput: FC<FileInputProps> = ({
  className = "",
  onChange,
  disabled,
  fileName,
  error,
  accept,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className={`relative flex h-11 w-full items-center justify-between
        rounded-lg border px-4
        text-sm shadow-theme-xs transition-colors
        focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10
        ${error ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10 bg-red-50 dark:bg-red-900/10" : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        ${className}`}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      {/* Left: file name */}
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-gray-400">📄</span>
        <span
          title={fileName || ""}
          className={`truncate ${fileName ? "text-gray-800 dark:text-white/90" : "text-gray-400 italic"
            }`}
        >
          {fileName ? truncateFileName(fileName) : "No file selected"}
        </span>
      </div>

      {/* Right: Browse */}
      <button
        type="button"
        disabled={disabled}
        className="ml-3 rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white
        transition hover:bg-gray-700 disabled:opacity-50"
      >
        Browse
      </button>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        disabled={disabled}
        accept={accept}
        onChange={onChange}
      />
    </div>
  );
};

export default FileInput;
