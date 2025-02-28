import React, { FC, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "../Button";
import "./style.css";

export type CollectionCardType = {
  name: string;
  des: string;
  text: string;
  source?: any;
};

interface CollectionCardProps {
  name: string;
  des: string;
  text: string;
  source?: any;
  width: number;
  height: number;
}

const CollectionCard: FC<CollectionCardProps> = ({
  name,
  des,
  text,
  width,
  height,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <div
      className="relative rounded-3xl overflow-hidden cursor-pointer"
      style={{ width, height }}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      onTouchStart={() => setIsFocused(true)}
      onTouchEnd={() => setIsFocused(false)}
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 collection-card-bg-gradient"
        animate={
          isFocused
            ? { backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"] }
            : {}
        }
        transition={
          isFocused
            ? { repeat: Infinity, duration: 3, ease: "linear" }
            : { duration: 0.5 }
        }
      />

      {/* Dark overlay */}
      <div className="absolute inset-[1px] rounded-3xl bg-[#1c1c1c] z-10"></div>
      <AnimatePresence>
        <motion.div
          transition={{ duration: 0.3, ease: "easeInOut" }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="absolute left-[1px] right-[1px] bottom-[1px] p-4 rounded-b-3xl bg-black/5 backdrop-blur-md z-20 h-auto"
        >
          <h3 className="text-white font-semibold text-md">{name}</h3>
          <p className="text-slate-400 text-sm mt-2">{des}</p>
          <AnimatePresence>
            {isFocused && (
              <motion.div
                layout // Add this to enable smooth height transition
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="mt-4">
                  <p className="text-white text-sm">{text}</p>
                  <div className="flex items-center justify-center mt-4">
                    <Button
                      label="Explore Collection"
                      width="full"
                      type="colorful"
                      onClick={() => {}}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CollectionCard;
