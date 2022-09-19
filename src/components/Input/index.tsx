import React from 'react';
import classNames from 'classnames';

import styles from './styles.module.css';

interface InputProps {
  value?: string;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  className?: string;
  size?: 'xl' | 'lg' | 'md' | 'sm' | 'xs';
  type?: 'text' | 'number' | 'email' | 'tel' | 'password' | 'hidden';
  placeholder?: string;
  variant?: 'filled' | 'outlined';
  ref?: React.Ref<HTMLInputElement>;
}

const Input: React.FC<InputProps> = React.forwardRef(
  ({ size = 'lg', className, type = 'text', onChange, value, placeholder, variant }, ref) => {
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
        ref={ref}
      />
    );
  },
);

Input.displayName = 'Input';

export default Input;
