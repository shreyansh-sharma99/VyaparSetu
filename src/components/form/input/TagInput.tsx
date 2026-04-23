import { useState } from "react";

interface TagInputProps {
  name: string;
  register: any;
  setValue: any;
  watch: any;
  placeholder: string;
}

const TagInput: React.FC<TagInputProps> = ({ name, register, setValue, watch, placeholder }) => {
  const [inputValue, setInputValue] = useState("");
  // const tags = watch(name) || [];
  const rawTags = watch(name);

  const tags = Array.isArray(rawTags) ? rawTags : typeof rawTags === "string" && rawTags.includes(",") ? rawTags.split(",").map(t => t.trim()) : rawTags ? [rawTags] : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = inputValue.trim();

      if (value && !tags.includes(value)) {
        setValue(name, [...tags, value]);
      }

      setInputValue("");
    }
  };

  const removeTag = (tag: string) => {
    setValue(
      name,
      tags.filter((t: string) => t !== tag)
    );
  };

  return (
    <div
      className="w-full min-h-[42px] border border-gray-300 rounded px-2 py-2 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500"
    >
      {tags && tags?.map((tag: string) => (
        <span
          key={tag}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-red-600 font-bold leading-none"
          >
            ×
          </button>
        </span>
      ))}

      {/* Hidden RHF input so data submits */}
      <input type="hidden" {...register(name)} value={tags} />

      {/* Visible typing input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          const value = inputValue.trim();
          if (value && !tags.includes(value)) {
            setValue(name, [...tags, value]);
          }
          setInputValue("");
        }}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-grow min-w-[120px] outline-none border-none focus:ring-0 p-1"
      />
    </div>
  );
};

export default TagInput;
