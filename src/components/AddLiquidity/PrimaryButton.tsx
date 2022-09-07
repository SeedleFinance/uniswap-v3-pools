import React, { ReactNode } from 'react';

interface Props {
  onClick: () => void;
  pending: boolean;
  children: ReactNode;
}

function PrimaryButton({ pending, children, onClick }: Props) {
  const pendingStyles = pending ? 'text-gray-200 border-gray-300' : 'text-gray-500 border-gray-500';
  return (
    <button
      className={`p-2 focus:outline-none border rounded font-bold ${pendingStyles}`}
      tabIndex={8}
      disabled={pending}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
