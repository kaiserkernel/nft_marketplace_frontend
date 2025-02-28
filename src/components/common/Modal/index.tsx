import { FC, ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../Button";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  btnText: string;
  handleClick: () => void;
}

const Modal: FC<ModalProps> = ({
  title,
  children,
  btnText,
  isOpen,
  onClose,
  handleClick,
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
            className="relative w-5/12 md:w-[30%] h-1/2 md:h-[80%] bg-[#262629] rounded-3xl shadow-lg"
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
            <div className="w-full px-8 h-[75%] overflow-x-hidden overflow-y-scroll">
              {children}
            </div>

            {/* Footer */}
            <div className="absolute bottom-1 w-full p-4">
              <Button
                label={btnText}
                type="blue"
                width="full"
                onClick={handleClick}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
