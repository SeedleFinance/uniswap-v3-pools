import React, { ReactNode } from "react";

interface Props {
  compact?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  onClick: () => void;
  type?: "submit" | "button" | "reset";
  onMouseOver?: () => void;
  onMouseOut?: () => void;
}

export const UnstyledButton = ({
  disabled,
  children,
  className,
  onClick,
  onMouseOver,
  onMouseOut,
  type,
}: Props) => {
  return (
    <button
      className={`focus:outline-none appearance-none ${className}`}
      disabled={disabled}
      type={type || "button"}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {children}
    </button>
  );
};

export const Button = ({
  compact,
  children,
  className,
  onClick,
  type = "submit",
  disabled = false,
}: Props) => {
  const sizing = compact ? "px-2 py-1 text-md" : "p-2 text-lg";
  const disabledShade = disabled ? "opacity-50" : "";

  return (
    <UnstyledButton
      className={`rounded-md shadow-inner focus:shadow-md border border-solid border-gray-600 text-gray-900 ${sizing} ${disabledShade} ${
        className || ""
      }`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </UnstyledButton>
  );
};
