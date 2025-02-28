import React from "react";
import { FaInfoCircle } from "react-icons/fa";

const Alert = ({ title, message }: { title: string; message: string }) => {
  return (
    <div className="w-full rounded-xl flex flex-row items-start gap-3 overflow-hidden bg-[#3D3D3F] p-4">
      <FaInfoCircle className="text-blue-500 w-5 h-5" />
      <div className="flex-1">
        <h4 className="text-white font-semibold text-sm">{title}</h4>
        <p className="mt-2 text-white/50 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default Alert;
