import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import styles from './styles.module.css';

interface ButtonProps {
  disabled?: boolean;
  className?: string;
  tabIndex?: number;
  children: ReactNode;
  onClick?: (ev: any) => void;
  type?: 'submit' | 'button' | 'reset';
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'lg' | 'md' | 'sm';
  href?: string;
}

export const ButtonComponent = ({
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
  const isExternalLink = href && href.startsWith('http');

  // Use the Link component as a button for internal links
  if (href && !isExternalLink) {
    return (
      <Link
        to={href}
        className={
          (styles['button'], styles[`button--${variant}`], styles[`button--${size}`], className)
        }
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={className}
      disabled={disabled}
      type={type || 'button'}
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
  type = 'submit',
  disabled = false,
  variant = 'primary',
  size = 'lg',
  href,
}: ButtonProps) => {
  return (
    <ButtonComponent
      className={classNames(
        styles['button'],
        styles[`button--${variant}`],
        styles[`button--${size}`],
        className,
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
