import React from "react";

import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { formatDate } from "../../utils/FormatDate";

import { CollectionProps } from "../../types";

interface CollectionShowModalProps {
    collection: CollectionProps,
    setConfirmedCollectionAddress: React.Dispatch<React.SetStateAction<string | null>>;
    isOpen: boolean,
    onClose: () => void
}

const CollectionShowModal: React.FC<CollectionShowModalProps> = (props) => {
    const { collection, setConfirmedCollectionAddress, isOpen, onClose } = props;
    const { name, description, image, symbol, createdAt } = collection;

    const handleConfirm = () => {
        setConfirmedCollectionAddress(collection.contractAddress);
        onClose();
    }

    return (
        <Modal
            title="Select Collection"
            isOpen={isOpen}
            onClose={onClose}
            btnLabel="Select"
            btnType="blue"
            btnClick={handleConfirm}
        >
            {/* name */}
            <div className="mt-4 bg-black p-3 rounded-md">
                <span className="text-white font-semibold text-md mb-2">
                    Name : 
                </span>
                <span className="text-white ps-3">{name}</span>
            </div>
            <div className="py-4">
                <img src={image} alt={`${name} collection image`} className="rounded-lg"/>
            </div>
            {/* symbol */}
            <div className="mt-4 bg-black p-3 rounded-md">
                <span className="text-white font-semibold text-md mb-2">
                    Symbol : 
                </span>
                <span className="text-white ps-3">{symbol}</span>
            </div>
            <div className="mt-4 bg-black p-3 rounded-md">
                <p className="text-white font-semibold text-md mb-2">
                    Description : 
                </p>
                <p className="text-white ps-3">{description}</p>
            </div>
            <div className="mt-4 p-3 bg-black rounded-md">
                <span className="text-white font-semibold text-md mb-2">
                    Created : 
                </span>
                <span className="text-white ps-3">{formatDate(createdAt)}</span>
            </div>
        </Modal>
    )
}

export default CollectionShowModal;