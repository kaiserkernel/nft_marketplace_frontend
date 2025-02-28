import React, { FC } from "react";

interface AttributeInputProps {
  trait: string;
  value: string;
  onChangeTrait: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const AttributeInput: FC<AttributeInputProps> = ({
  trait,
  value,
  onChangeTrait,
  onChangeValue,
  onRemove,
}) => {
  return (
    <div className="relative w-full border border-[#3D3D3F] rounded-xl bg-[#0c0c0c] p-4">
      <input
        className="block border-none outline-none bg-transparent text-sm text-blue-500"
        placeholder="Trait type"
        value={trait}
        onChange={onChangeTrait}
      />
      <input
        className="block border-none outline-none bg-transparent text-sm text-white mt-2"
        placeholder="Value"
        value={value}
        onChange={onChangeValue}
      />
      <button
        className="absolute top-1 right-1 text-3xl w-10 h-10 rounded-full text-[#3D3D3F]"
        onClick={onRemove}
      >
        &times;
      </button>
    </div>
  );
};

export default AttributeInput;
