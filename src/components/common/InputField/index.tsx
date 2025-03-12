import React, { ChangeEvent, FC, useState } from "react";
import { motion } from "framer-motion";
import "./style.css";

interface InputFieldProps {
  itemType: "colorful" | "default";
  type: "text" | "number";
  name: string;
  icon?: React.ReactNode;
  placeholder?: string;
  value: any;
  min?: number;
  max?: number;
  width?: number;
  bordered?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputField: FC<InputFieldProps> = ({
  itemType,
  type,
  name,
  icon,
  placeholder,
  value,
  min,
  max,
  width,
  bordered,
  onChange,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  if (itemType === "colorful") {
    return (
      <div
        className="relative h-10 rounded-lg overflow-hidden"
        style={{ width }}
      >
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 input-field-bg-gradient"
          animate={{ backgroundPosition: ["100% 0%", "0% 50%", "100% 50%"] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-[1px] flex flex-row items-center justify-center gap-2 p-4 bg-[#1c1c1c] rounded-lg">
          {icon}
          <input
            className="w-full p-2 outline-none border-none text-white text-sm bg-transparent"
            type={type}
            name={name}
            placeholder={placeholder}
            value={value ?? ""}
            min={min}
            max={max}
            onChange={onChange}
          />
        </div>
      </div>
    );
  }
  return (
    <div
      className={`flex flex-row items-center gap-4 px-4 py-3 border hover:border-blue-500 transition-all duration-300 ease-in-out rounded-xl overflow-hidden ${
        isFocused
          ? "border-blue-500 bg-black/80"
          : `${bordered ? "border-[#3D3D3F]" : "border-[#1F1F21]"} bg-[#1F1F21]`
      } ${!width && "w-full"}`}
      style={{ width }}
    >
      {/* Dark overlay */}
      {icon && icon}
      <input
        className="w-full outline-none border-none text-white text-sm bg-transparent"
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};

export default InputField;
