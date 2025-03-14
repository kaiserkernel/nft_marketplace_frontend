import { FC, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";

import Button from "../Button";

import { CollectionProps, NFTProps } from "../../../types";

import "./style.css";

interface CardBtnProps {
  collection?: CollectionProps,
  nft?: NFTProps,
  cardType: "Collection" | "NFT"
}

const CardBtn: FC<CardBtnProps> = ({ collection, nft, cardType }) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Memoize card data based on the card type
  const cardData = useMemo(() => {
    if (cardType === "Collection" && collection) {
      return {
        name: collection.name || null,
        description: collection.description || null,
        symbol: collection.symbol || null,
        image: collection.image || null,
      };
    }

    if (cardType === "NFT" && nft) {
      return {
        name: nft.name || null,
        description: nft.description || null,
        image: nft.image || null,
      };
    }

    return {};
  }, [cardType, collection, nft]);
  const handleViewCardClick = () => {
    if ( cardType === "Collection" )
      navigate("/collection-view", { state: collection })
    if (cardType === "NFT")
      navigate("/auction-view", { state: nft })
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
      style={{ backgroundImage: `url(${cardData.image})` }}
    >
      {/* Dark overlay */}
      <AnimatePresence>
        <motion.div
          transition={{ duration: 0.3, ease: "easeInOut" }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="absolute left-[1px] right-[1px] bottom-[1px] p-4 rounded-b-3xl bg-black/5 backdrop-blur-md z-20 h-auto"
        >
          { cardData.name && <h3 className="text-white font-semibold text-md">{cardData.name}</h3> }
          { cardData.description && <p className="text-white text-sm mt-2">{cardData.description}</p>}
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
                  {cardData.symbol && <p className="text-white text-sm font-bold">{cardData.symbol}</p>}
                  <div className="flex items-center justify-center mt-4">
                    <Button
                      label="Explore Collection"
                      width="full"
                      type="colorful"
                      onClick={handleViewCardClick}
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

export default CardBtn;
