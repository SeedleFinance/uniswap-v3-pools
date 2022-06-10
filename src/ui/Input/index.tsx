import React from 'react';
import classNames from 'classnames';

import styles from './styles.module.css';

interface InputProps {
  size: 'xl' | 'lg' | 'md' | 'sm' | 'xs';
  value: string;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  className?: string;
  type?: 'text' | 'number' | 'email' | 'tel' | 'password' | 'hidden';
  placeholder?: string;
  variant?: 'filled' | 'outlined';
}

const Input: React.FC<InputProps> = ({
  size = 'lg',
  className,
  type = 'text',
  onChange,
  value,
  placeholder,
  variant,
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      autoComplete="off"
      onChange={onChange}
      className={classNames(
        className,
        styles['input'],
        styles[`input--${size}`],
        styles[`input--${variant}`],
      )}
    />
  );
};

export default Input;
