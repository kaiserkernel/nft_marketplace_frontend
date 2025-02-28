import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import Avatar from "../Avatar";
import { FaFileArchive } from "react-icons/fa";

const Banner = () => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="relative w-full h-[250px] rounded-3xl bg-gradient"
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      onTouchStart={() => setIsFocused(true)}
      onTouchEnd={() => setIsFocused(false)}
    >
      <div className="absolute rounded-3xl inset-[1px] bg-[#1c1c1c]">
        {/* Background Image */}
        {image && (
          <img
            src={image}
            alt="Selected Banner"
            className="absolute inset-0 w-full h-full object-cover rounded-3xl"
          />
        )}

        {/* Avatar */}
        <div className="absolute -bottom-5 left-5 z-10">
          <Avatar size={100} shadow />
        </div>

        {/* Animated Transparent Overlay */}
        <motion.div
          className="absolute bottom-0 w-full rounded-3xl bg-black/30 backdrop-blur-md overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={
            isFocused ? { height: 248, opacity: 1 } : { height: 0, opacity: 0 }
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* Animated Button */}
        <motion.label
          className="py-2 px-4 text-white absolute bottom-5 right-5 flex flex-row items-center justify-center gap-2 bg-black/40 backdrop-blur-lg rounded-lg text-sm hover:bg-black/100 shadow-black hover:shadow-2xl transition cursor-pointer"
          initial={{ y: 20, opacity: 0 }}
          animate={isFocused ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
          onClick={triggerFileInput}
        >
          Change Banner
          <FaFileArchive className="text-white" />
        </motion.label>
      </div>
    </div>
  );
};

export default Banner;
