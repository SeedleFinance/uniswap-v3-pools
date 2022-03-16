import React, { ReactNode } from "react";

interface Props {
  compact?: boolean;
  disabled?: boolean;
  className?: string;
  tabIndex?: number;
  children: ReactNode;
  onClick?: (ev: any) => void;
  type?: "submit" | "button" | "reset";
  onMouseOver?: () => void;
  onMouseOut?: () => void;
}

export const UnstyledButton = ({
  disabled,
  children,
  className,
  tabIndex,
  onClick,
  onMouseOver,
  onMouseOut,
  type,
}: Props) => {
  return (
    <button
      className={`rounded-md focus:outline-none p-2 border border-transparent focus:border-dotted focus:border-gray-200 dark:focus:border-white dark:text-gray-100 appearance-none ${className}`}
      disabled={disabled}
      type={type || "button"}
      tabIndex={tabIndex}
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
  tabIndex,
  type = "submit",
  disabled = false,
}: Props) => {
  const sizing = compact ? "px-2 py-1 text-md" : "p-2 text-lg";
  const disabledShade = disabled ? "opacity-50" : "";

  return (
    <UnstyledButton
      className={`rounded-md shadow-inner focus:shadow-md border border-solid border-gray-600 focus:border-gray-800 text-gray-900 ${sizing} ${disabledShade} ${
        className || ""
      }`}
      onClick={onClick}
      type={type}
      tabIndex={tabIndex}
      disabled={disabled}
    >
      {children}
    </UnstyledButton>
  );
};
