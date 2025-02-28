import React, { ReactNode } from "react";
import { motion } from "framer-motion";

const IconButton = ({
  icon,
  onClick,
}: {
  icon: ReactNode;
  onClick: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative w-12 h-12 rounded-2xl bg-gradient"
    >
      <div className="absolute rounded-2xl inset-[3px] bg-white">
        <motion.button
          className="absolute rounded-2xl inset-[1px] flex items-center justify-center bg-gradient"
          onClick={onClick}
          whileHover={{ backgroundColor: "#f0f0f0" }}
          whileTap={{ backgroundColor: "#e0e0e0" }}
        >
          {icon}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default IconButton;
