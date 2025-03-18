import React, { useEffect } from "react";

export type DropdownItemType = {
  label: string;
  icon?: React.ReactNode;
  link?: string;
  checked?: boolean
};

interface DropdownProps {
  items: DropdownItemType[];
  children: React.ReactNode;
  ref: any;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  className?: string;
  setSelectedItem: React.Dispatch<React.SetStateAction<string>>;
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  children,
  ref,
  isOpen,
  setIsOpen,
  className,
  setSelectedItem
}) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickItem = (_clickedItem: string) => {
    setSelectedItem(_clickedItem);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Dropdown Button */}
      {children}
      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 bg-[#111111] z-50 border border-[#444444] rounded-lg overflow-hidden ${className}`}>
          <ul className="py-2 px-4">
            {items.map((item, index) => (
              <li
                className="p-4 mt-4 mb-2 cursor-pointer hover:bg-[#1c1c1c] transition rounded-lg"
                key={index}
              >
                <button className="flex flex-row items-center gap-4" onClick={() =>handleClickItem(item.label)}>
                  {item.icon && item.icon}
                  <span className="text-white text-md whitespace-nowrap">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
