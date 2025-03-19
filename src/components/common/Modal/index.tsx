import { FC, ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Button from "../Button";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  btnLabel: string,
  btnType: "colorful" | "primary" | "outline" | "blue" | "text",
  btnClick: () => void
  btnProcessing?: boolean,
  size?: "small"
}

const Modal: FC<ModalProps> = ({
  title,
  children,
  isOpen,
  onClose,
  btnLabel,
  btnType,
  btnClick,
  btnProcessing,
  size
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-30 flex justify-center items-start md:items-center pt-10 md:pt-0">
          {/* Overlay */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 1.2 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`relative w-[90%] md:w-[30%] h-3/4 ${size === "small" ? "md:h-[50%]" : "md:h-[80%]"} bg-[#262629] rounded-3xl shadow-lg`}
          >
            <div className="flex flex-row items-center justify-between px-4 py-3">
              {/* Header */}
              <div className="px-4">
                <h2 className="text-2xl font-semibold text-white">{title}</h2>
              </div>
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-4xl w-10 h-10 bg-[#313135] hover:bg-[#454548] transition rounded-full focus:outline-none text-white"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="w-full px-8 h-[70%] overflow-x-hidden overflow-y-scroll">
              {children}
            </div>

            {/* Footer */}
            <div className="absolute bottom-1 p-4 w-full">
              <Button
                label={btnLabel}
                type={btnType}
                width="full"
                onClick={btnClick}
                disabled={btnProcessing}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
