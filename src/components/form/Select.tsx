

// components/form/Select.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { DropDownIcon } from "@/icons/icons";
import "../../index.css";

interface Option {
  value: string;
  label: string;
  element?: React.ReactNode;
}

interface SelectProps {
  options?: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  value?: string;
  className?: string;
  error?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options = [],
  placeholder = "Select an option",
  onChange,
  className = "",
  value = "",
  error = false,
  loading = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState("");
  const [internalValue, setInternalValue] = useState<string>(value || "");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        wrapperRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useLayoutEffect(() => {
    if (!isOpen) return;

    const calc = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setDropdownStyle({
        position: "absolute",
        left: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY,
        width: rect.width,
        zIndex: 100005, // Higher than Modal's z-99999
      });
    };

    calc();
    window.addEventListener("resize", calc);
    window.addEventListener("scroll", calc, true);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("scroll", calc, true);
    };
  }, [isOpen]);

  const selectedLabel =
    options.find((o) => o.value === internalValue)?.label || "";

  const displayValue = isOpen ? search : selectedLabel;

  const filteredOptions = options.filter((option) =>
    option.label?.toLowerCase().includes(search.toLowerCase())
  );

  const baseClasses = `h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${className}`;

  const borderClasses = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500"
    : "border-gray-300 focus:border-blue-800 focus:ring-blue-500/10 dark:border-gray-700 dark:focus:border-blue-800";

  const handleOptionClick = (option: Option) => {
    setInternalValue(option.value);
    onChange(option.value);
    setIsOpen(false);
    setSearch("");
    inputRef.current?.blur();

  };

  const dropdown = (
    <div ref={dropdownRef}

      style={dropdownStyle}
      className="rounded-lg border border-gray-300 bg-white dark:bg-gray-900 shadow-lg max-h-60 overflow-auto scrollbar-hide hover:scrollbar-default"
    >
      {filteredOptions.length > 0 ? (
        filteredOptions.map((option) => (
          <div
            key={option.value}
            className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white ${option.value === internalValue ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
            onMouseDown={(e) => {
              e.preventDefault();
              handleOptionClick(option);
            }}
          >
            {option.element || option.label}
          </div>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
          No results found
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          className={`${baseClasses} ${borderClasses} pr-10`}
          placeholder={loading ? "Loading..." : placeholder}
          value={displayValue}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setSearch("");
            }
          }}
          onChange={(e) => {
            if (!disabled) {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
            }
          }}
          disabled={disabled}
          readOnly={false}
        />
        <DropDownIcon className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && !loading && ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
};

export default Select;
