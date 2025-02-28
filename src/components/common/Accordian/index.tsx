import React, { FC, ReactNode, useState } from "react";
import { FaAngleDown } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

interface AccordionProps {
  label: string;
  children: ReactNode;
}

const Accordion: FC<AccordionProps> = ({ label, children }) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <div className="w-full border-b border-[#3D3D3F] py-4">
      <button
        className="w-full flex flex-row items-center justify-between"
        onClick={() => setIsFocused(!isFocused)}
      >
        <span className="text-white font-semibold text-md">{label}</span>
        <FaAngleDown
          className={`text-[#3D3D3F] transition-transform duration-300 ease-in-out ${
            isFocused ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`overflow-hidden ${isFocused ? "block" : "hidden"}`}
          >
            <div className="py-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
