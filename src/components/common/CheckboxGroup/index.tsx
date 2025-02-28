import React, { FC, ReactNode } from "react";

export type CheckBoxItemType = {
  label: string;
  icon?: ReactNode;
  checked: boolean;
};

interface CheckboxGroupProps {
  items: CheckBoxItemType[];
  onSelect: (index: number) => void;
}

const CheckboxGroup: FC<CheckboxGroupProps> = ({ items, onSelect }) => {
  return (
    <div className="w-full">
      {items.map((item, index) => (
        <label
          key={index}
          className="flex items-center gap-4 cursor-pointer text-white text-md transition-all duration-300 ease-in-out hover:bg-[#1F1F21] py-3 px-2 rounded-xl"
        >
          {/* Hidden Input */}
          <input
            type="checkbox"
            checked={item.checked}
            className="hidden peer"
            onChange={() => onSelect(index)} // ✅ Moved onChange here for proper event handling
          />
          {/* Outer Circle */}
          <div
            className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all 
            ${item.checked ? "border-blue-500" : "border-gray-400"}
          `}
          >
            {/* Inner Circle (Appears when checked) */}
            <div
              className={`w-3 h-3 bg-blue-500 rounded-sm transition-transform scale-0 
              ${item.checked ? "scale-100" : "scale-0"}
            `}
            />
          </div>
          {item.icon}
          {item.label}
        </label>
      ))}
    </div>
  );
};

export default CheckboxGroup;
