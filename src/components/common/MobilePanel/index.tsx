import { ReactNode } from "react";
import { FaWindowClose } from "react-icons/fa";

interface MobilePanelProps {
    isOpen: boolean,
    onClose: () => void,
    children?: ReactNode
}

export const MobilePanel = (props: MobilePanelProps) => {
    const {isOpen, onClose, children} = props;
    return (
        <div
            className={`md:hidden z-50 fixed bottom-0 left-0 w-full h-3/4 bg-[#0C0C0C] text-white flex flex-col transition-transform duration-300 ${
                isOpen ? "translate-y-0" : "translate-y-full"
            }`}
            >
            {/* Close Button - Positioned at the Top-Right */}
            <button
                className="absolute top-4 right-4 rounded"
                onClick={onClose}
            >
                <FaWindowClose />
            </button>

            {/* Panel Content */}
            <div className="flex-1 flex items-center justify-center px-4">
                {children}
            </div>
        </div>
    )
}