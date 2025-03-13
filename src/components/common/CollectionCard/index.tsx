import { FC, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";

import { CollectionProps } from "../../../types";

import Button from "../Button";

import "./style.css";

const CollectionCard: FC<{collection: CollectionProps}> = ({collection}) => {
  const { name, description, symbol, image } = collection;

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleViewCollectionClick = () => {
    navigate("/collection-view", { state: collection })
  }

  return (
    <div
      className="relative cursor-pointer rounded-3xl border-4 border-grey-700 shadow-lg shadow-grey-700/50 overflow-hidden
                xl:w-[25vw] xl:h-[25vw] 
                lg:w-[30vw] lg:h-[30vw] 
                md:w-[40vw] md:h-[40vw] 
                sm:w-[60vw] sm:h-[60vw] 
                w-[65vw] h-[65vw] mx-auto
                bg-no-repeat bg-center bg-cover"
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      onTouchStart={() => setIsFocused(true)}
      onTouchEnd={() => setIsFocused(false)}
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* Dark overlay */}
      <AnimatePresence>
        <motion.div
          transition={{ duration: 0.3, ease: "easeInOut" }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="absolute left-[1px] right-[1px] bottom-[1px] p-4 rounded-b-3xl bg-black/5 backdrop-blur-md z-20 h-auto"
        >
          <h3 className="text-white font-semibold text-md">{name}</h3>
          <p className="text-white text-sm mt-2">{description}</p>
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
                  <p className="text-white text-sm font-bold">{symbol}</p>
                  <div className="flex items-center justify-center mt-4">
                    <Button
                      label="Explore Collection"
                      width="full"
                      type="colorful"
                      onClick={handleViewCollectionClick}
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
