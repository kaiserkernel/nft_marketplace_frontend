import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { CollectionProps } from "../../types";
import Button from "../../components/common/Button";

interface CollectionShowModalProps {
    collection: CollectionProps,
    setConfirmedCollectionId: React.Dispatch<React.SetStateAction<string | null>>;
    isOpen: boolean,
    onClose: () => void
}

const CollectionShowModal: React.FC<CollectionShowModalProps> = (props) => {
    const { collection, setConfirmedCollectionId, isOpen, onClose } = props;
    const { name, description, image, symbol, createdAt } = collection;
    return (
        <AnimatePresence>
            {
                isOpen && (
                    <div className="fixed z-50 inset-0 bg-black bg-opacity-30 flex justify-center items-start md:items-center pt-10 md:pt-0">
                        {/* Overlay */}
                        <div className="absolute inset-0" onClick={onClose} />

                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 1.2 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="relative w-5/12 md:w-[30%] h-1/2 md:h-[80%] bg-[#262629] rounded-3xl shadow-lg"
                        >
                            {name}
                            <img src={image} alt={`Collection "name" image`}/>
                            Description: {description}
                            Tokensymbol: {symbol}
                            Created: {createdAt}
                        </motion.div>
                        <Button 
                            type="primary" label="Ok" 
                            onClick={() => {
                                setConfirmedCollectionId(collection._id);
                                onClose();
                            }}/>
                        <Button 
                            type="outline" label="Cancel" 
                            onClick={onClose}
                        />
                    </div>
                )
            }
        </AnimatePresence>
    )
}

export default CollectionShowModal;