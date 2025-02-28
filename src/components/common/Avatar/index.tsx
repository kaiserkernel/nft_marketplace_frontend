import React, { useState } from "react";
import { FaUser } from "react-icons/fa";

const Avatar = ({
  img,
  size,
  shadow,
}: {
  img?: string;
  size: number;
  shadow?: boolean;
}) => {
  return (
    <div
      className={`relative rounded-full bg-gradient shadow-2xl shadow-black ${
        shadow && "shadow-[0px_1px_2px_5px_rgba(0,0,0,0.2)]"
      }`}
      style={{ width: size, height: size }}
    >
      <div className="absolute rounded-full inset-[1px] bg-[#1C1C1C] flex flex-col items-center justify-center">
        {img ? (
          <img src={img} alt="avatar" className="w-full h-auto rounded-full" />
        ) : (
          <FaUser className="text-white/80 w-8 h-8" />
        )}
      </div>
    </div>
  );
};

export default Avatar;
