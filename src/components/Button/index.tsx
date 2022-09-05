import React, { ReactNode } from "react";
import Link from "next/link";
import classNames from "classnames";

import styles from "./styles.module.css";

interface ButtonProps {
  disabled?: boolean;
  className?: string;
  tabIndex?: number;
  children: ReactNode;
  onClick?: (ev: any) => void;
  type?: "submit" | "button" | "reset";
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "lg" | "md" | "sm" | "xs";
  href?: string;
}

const ButtonComponent = ({
  disabled,
  children,
  className,
  tabIndex,
  onClick,
  onMouseOver,
  onMouseOut,
  type,
  variant,
  size,
  href,
}: ButtonProps) => {
  const isExternalLink = href && href.startsWith("http");

  // Use the Link component as a button for internal links
  if (href && !isExternalLink) {
    return (
      <Link href={href}>
        <a
          className={classNames(
            styles["btn"],
            styles[`btn--${variant}`],
            styles[`btn--${size}`],
            className
          )}
        >
          {children}
        </a>
      </Link>
    );
  }

  return (
    <button
      className={className}
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

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  onClick,
  tabIndex,
  type = "submit",
  disabled = false,
  variant = "primary",
  size = "md",
  href,
}: ButtonProps) => {
  return (
    <ButtonComponent
      className={classNames(
        styles["btn"],
        styles[`btn--${variant}`],
        styles[`btn--${size}`],
        className
      )}
      onClick={onClick}
      type={type}
      tabIndex={tabIndex}
      disabled={disabled}
      href={href}
    >
      {children}
    </ButtonComponent>
  );
};

export default Button;
