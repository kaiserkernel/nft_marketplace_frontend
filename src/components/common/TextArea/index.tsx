import React, { FC, useState } from "react";

interface TextAreaProps {
  label: string;
  placeholder?: string;
  value?: string;
  max?: number;
  onChange?: (value: string) => void; // New prop for handling changes
}

const TextArea: FC<TextAreaProps> = ({
  label,
  placeholder,
  value = "",
  max = 700,
  onChange,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [text, setText] = useState<string>(value);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setText(newValue); // Update local state
    onChange?.(newValue); // Call parent handler if provided
  };

  return (
    <div className="w-full">
      <label className="block text-md text-white font-semibold">{label}</label>
      <textarea
        className={`w-full h-[120px] mt-2 border rounded-xl text-sm ${
          isFocused
            ? "bg-black/80 border-blue-500"
            : "bg-[#1F1F21] border-[#3D3D3F]"
        }  outline-none transition-all duration-300 ease-in-out py-2 px-4 text-sm text-white`}
        placeholder={placeholder}
        maxLength={max}
        value={text}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={handleChange}
        style={{ resize: "none" }}
      />
    </div>
  );
};

export default TextArea;
