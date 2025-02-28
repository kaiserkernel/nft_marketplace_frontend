import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaCloudUploadAlt } from "react-icons/fa";

const CollectionAvatar = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image")) {
      const fileUrl = URL.createObjectURL(file);
      setImage((prevImage) => {
        if (prevImage) URL.revokeObjectURL(prevImage);
        return fileUrl;
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-[100px] flex flex-row items-center justify-between gap-4">
      <div
        className="w-[100px] h-[100px] bg-[#444444] rounded-full flex relative flex-col items-center justify-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {image ? (
          <img
            src={image}
            alt="Uploaded"
            className="w-[99px] h-[99px] object-cover rounded-full"
          />
        ) : (
          <>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <FaCloudUploadAlt
              className="text-white w-10 h-10 cursor-pointer"
              onClick={triggerFileInput}
            />
          </>
        )}

        {/* Animated Transparent Overlay */}
        {image && (
          <>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <motion.div
              className="absolute bottom-0 w-[100px] h-[100px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
              initial={{ height: 0, opacity: 0 }}
              animate={
                isHovered
                  ? { height: "100%", opacity: 1 }
                  : { height: 0, opacity: 0 }
              }
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <motion.label
                className="p-2 rounded-full text-white flex flex-col items-center justify-center bg-black/60 backdrop-blur-lg hover:bg-black/100 shadow-black hover:shadow-2xl transition cursor-pointer"
                initial={{ y: 20, opacity: 0 }}
                animate={
                  isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }
                }
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
                onClick={triggerFileInput}
              >
                <FaCloudUploadAlt className="text-white" />
              </motion.label>
            </motion.div>
          </>
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-white font-semibold text-md">
          Upload Collection Avatar
        </h4>
        <p className="text-white/30 text-sm mt-2">
          File types supported: JPG, PNG, SVG, GIF, and WEBP
        </p>
      </div>
    </div>
  );
};

export default CollectionAvatar;
