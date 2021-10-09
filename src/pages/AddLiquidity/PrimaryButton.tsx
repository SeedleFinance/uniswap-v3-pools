import React, { ReactNode } from "react";

interface Props {
  onClick: () => void;
  children: ReactNode;
}

function PrimaryButton({ children, onClick }: Props) {
  return (
    <button
      className="p-2 focus:outline-none text-gray-500 border rounded border-gray-500 font-bold"
      tabIndex={8}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
