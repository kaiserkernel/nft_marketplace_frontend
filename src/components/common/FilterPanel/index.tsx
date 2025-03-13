import React from "react";

interface FilterPanelProps {
    title: string;
    panelKey: string;
    isOpen: boolean;
    togglePanel: (panel: string) => void;
    children?: React.ReactNode;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ title, panelKey, isOpen, togglePanel, children }) => (
    <div className="border-b border-gray-700">
        <div 
            className="flex justify-between items-center p-4 pl-0 cursor-pointer"
            onClick={() => togglePanel(panelKey)}
        >
            <span className="text-lg font-semibold text-white">{title}</span>
            <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
                <img src="/arrow-down.webp" alt="toggle-arrow" className="h-4 w-4" />
            </span>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
            {children}
        </div>
    </div>
);

export default FilterPanel;