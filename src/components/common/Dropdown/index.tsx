import React, { useEffect, ReactNode, FC } from "react";

export type DropdownItemType = {
  label: string;
  icon?: ReactNode;
  link?: string;
};

interface DropdownProps {
  items: DropdownItemType[];
  children: ReactNode;
  ref: any;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const Dropdown: FC<DropdownProps> = ({
  items,
  children,
  ref,
  isOpen,
  setIsOpen,
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

  return (
    <div className="relative inline-block w-full" ref={ref}>
      {/* Dropdown Button */}
      {children}
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[#111111] border border-[#444444] rounded-lg overflow-hidden">
          <ul className="py-2 px-4">
            {items.map((item, index) => (
              <li
                className="p-4 mt-4 mb-2 cursor-pointer hover:bg-[#1c1c1c] transition rounded-lg"
                key={index}
              >
                <button className="flex flex-row items-center gap-4 w-full">
                  {item.icon && item.icon}
                  <span className="text-white text-md">{item.label}</span>
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
