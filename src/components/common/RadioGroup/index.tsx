import React, { FC } from "react";
import { ItemGroupList } from "../../../types";

interface RadioGroupProps {
  items: ItemGroupList[];
  onSelect: (val: number) => void;
}

const RadioGroup: FC<RadioGroupProps> = ({ items, onSelect }) => {
  return (
    <form className="w-full">
      {items.map((item, index) => (
        <label
          key={index}
          className="flex items-center gap-4 cursor-pointer text-white text-md transition-all duration-300 ease-in-out hover:bg-[#1F1F21] py-3 px-2 rounded-xl"
        >
          {/* Hidden Input */}
          <input
            type="radio"
            checked={item.checked}
            className="hidden peer"
            readOnly
            onChange={() => onSelect(index)}
          />
          {/* Outer Circle */}
          <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center peer-checked:border-blue-500 transition-all">
            {/* Inner Circle (Appears when checked) */}
            <div
              className={`w-3 h-3 bg-blue-500 rounded-full transition-transform scale-0 
              ${item.checked ? "scale-100" : "scale-0"}
            `}
            />
          </div>
          {item.label}
        </label>
      ))}
    </form>
  );
};

export default RadioGroup;
