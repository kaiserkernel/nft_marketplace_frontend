import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Avatar from "../Avatar";
import { FaFileArchive } from "react-icons/fa";
import LogoInput from "../LogoInput";

interface BannerProps {
  avatar: string | null;
  banner: string | null;
  setAvatarFile?: React.Dispatch<React.SetStateAction<File | null>>;
  setBannerFile?: React.Dispatch<React.SetStateAction<File | null>>;
  className?: string;
  status: "Read" | "Write";
}

const Banner = (props: BannerProps) => {
  const { avatar, banner, setAvatarFile, setBannerFile, className, status } =
    props;
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoImage, setLogoImage] = useState<string | null>(avatar);
  const [bannerImage, setBannerImage] = useState<string | null>(banner);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (status === "Write") {
      const file = event.target.files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setBannerImage(imageUrl);
        if (setBannerFile) setBannerFile(file);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    setLogoImage(avatar);
    setBannerImage(banner);
  }, [avatar, banner]);

  return (
    <div
      className={`${className} relative w-full rounded-3xl bg-gradient`}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      onTouchStart={() => setIsFocused(true)}
      onTouchEnd={() => setIsFocused(false)}
    >
      <div className="absolute rounded-3xl inset-[1px] bg-[#1c1c1c]">
        {/* Background Image */}
        {bannerImage && (
          <img
            src={bannerImage}
            alt={`Selected Banner: ${bannerImage}`}
            className="absolute inset-0 w-full h-full object-cover rounded-3xl"
          />
        )}

        {/* Avatar */}
        <div className="absolute -bottom-5 left-5 z-10">
          {/* use avatar */}
          {status === "Read" && <Avatar img={avatar ?? ""} size={100} shadow />}
          {status === "Write" && setAvatarFile && (
            <LogoInput
              logoImage={logoImage}
              setLogoImage={setLogoImage}
              setLogoImageFile={setAvatarFile}
              logoType="Profile"
            />
          )}
        </div>

        {/* Animated Transparent Overlay */}
        <motion.div
          className="absolute bottom-0 w-full rounded-3xl bg-black/30 backdrop-blur-md overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={
            isFocused && status === "Write"
              ? { height: 248, opacity: 1 }
              : { height: 0, opacity: 0 }
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
        {status === "Write" && (
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
        )}
      </div>
    </div>
  );
};

export default Banner;
