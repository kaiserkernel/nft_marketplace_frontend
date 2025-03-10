import React, { FC, ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { ThreeDot } from "react-loading-indicators"

interface ButtonProps {
  type: "colorful" | "primary" | "outline" | "blue" | "text";
  label: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  width?: "full" | number;
  onClick?: () => void;
  disabled?: boolean
}

const Button: FC<ButtonProps> = ({
  type,
  label,
  icon,
  iconPosition,
  width,
  onClick,
  disabled
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Calculate width class or inline style
  const widthClass = width === "full" ? "w-full" : "";
  const widthStyle = typeof width === "number" ? { width: `${width}px` } : {};

  if (type === "colorful") {
    return (
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={`relative ${widthClass} ${
          width ? "" : "w-40"
        } h-12 rounded-md overflow-hidden bg-gradient`}
        style={widthStyle}
      >
        {/* Outer gradient border */}
        <motion.div
          animate={{ opacity: isFocused ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-md bg-gradient"
        />

        {/* Inner container */}
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-[5px] rounded-md bg-white"
        >
          {/* Button */}
          <motion.button
            className="absolute inset-[1px] flex items-center justify-center text-white gap-4 rounded-md bg-gradient text-sm"
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
            onTouchStart={() => setIsFocused(true)}
            onTouchEnd={() => setIsFocused(false)}
          >
            {iconPosition === "left" && icon}
            {label}
            {iconPosition === "right" && icon}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <button
      className={`flex flex-row items-center justify-center py-3 rounded-xl px-5 gap-2 text-white transition-all duration-300 ease-in-out text-sm font-semibold 
        ${widthClass} 
        ${type === "primary" ? "bg-[#1F1F21] hover:bg-[#353537]" : ""} 
        ${type === "blue" ? "bg-[#3069FF] hover:bg-[#4076FF]" : ""} 
        ${
          type === "outline" &&
          "bg-[#131314] border border-[#3D3D3F] hover:bg-[#1E1E1F]"
        }
        ${type === "text" && "bg-transparent hover:bg-[#1E1E1F]"}
        `}
      style={widthStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {
        disabled ? <ThreeDot color="#ffffff" size="small" /> : (
          <>
            {iconPosition === "left" && icon}
            {label}
            {iconPosition === "right" && icon}
          </>
        )
      }
    </button>
  );
};

export default Button;
