import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from "../Button";

interface NFTBannerProps {
  height: number;
  image: string | null;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const NFTBanner: React.FC<NFTBannerProps> = ({ height, image, setImage }) => {
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      const fileType = file.type.startsWith("video") ? "video" : "image";
      setMediaType(fileType);
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
    <div
      className="w-full bg-gradient rounded-3xl relative overflow-hidden shadow-2xl shadow-black"
      style={{ height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-[1px] bg-[#131314] rounded-3xl flex flex-col items-center justify-center">
        {image ? (
          mediaType === "video" ? (
            <video
              className="w-full h-full object-contain rounded-3xl"
              autoPlay
            >
              <source src={image} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={image}
              alt="Uploaded"
              className="w-full h-full object-cover rounded-3xl"
            />
          )
        ) : (
          <>
            <div className="w-full flex flex-col items-center justify-center gap-2">
              <FaCloudUploadAlt className="w-10 h-10 text-white/30" />
              <span className="text-white text-md font-semibold">
                Upload a file
              </span>
              <span className="text-white/30 text-sm">
                Supported: JPG, PNG, SVG, GIF, WEBP, MP4
              </span>
              <span className="text-white/30 text-sm">Max. size: 5MB</span>
            </div>
            <input
              type="file"
              accept="image/*,video/mp4"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="h-4"></div>
            <Button
              type="blue"
              label="Upload"
              icon={<FaCloudUploadAlt className="text-white" />}
              iconPosition="left"
              onClick={triggerFileInput}
            />
          </>
        )}
      </div>

      {/* Animated Transparent Overlay */}
      {image && (
        <>
          <input
            type="file"
            accept="image/*,video/mp4"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <motion.div
            className="absolute bottom-0 w-full h-full rounded-3xl bg-black/40 backdrop-blur-md flex items-center justify-center"
            initial={{ height: 0, opacity: 0 }}
            animate={
              isHovered
                ? { height: "100%", opacity: 1 }
                : { height: 0, opacity: 0 }
            }
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <motion.label
              className="py-2 px-4 text-white flex flex-row items-center justify-center gap-2 bg-black/60 backdrop-blur-lg rounded-lg text-sm hover:bg-black/100 shadow-black hover:shadow-2xl transition cursor-pointer"
              initial={{ y: 20, opacity: 0 }}
              animate={isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
              onClick={triggerFileInput}
            >
              Change Media
              <FaCloudUploadAlt className="text-white" />
            </motion.label>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default NFTBanner;
