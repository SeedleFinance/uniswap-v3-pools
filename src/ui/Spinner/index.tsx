import React from 'react';
import classnames from 'classnames';

interface LoadingSpinnerProps {
  color?: string;
  centered?: boolean;
  className?: string;
  size?: string | number;
  strokeWidth?: string | number;
}

const Spinner: React.FC<LoadingSpinnerProps> = ({ className, color, size, strokeWidth }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={classnames(className, `animate-spin text-${color}`)}
  >
    <circle
      cx="50"
      cy="50"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      r="35"
      strokeDasharray="164.93361431346415 56.97787143782138"
      transform="matrix(1,0,0,1,0,0)"
    ></circle>
  </svg>
);

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  centered,
  color = 'green-500',
  size = 28,
  strokeWidth = 7,
  ...props
}) => {
  if (centered) {
    return (
      <div
        className={classnames(
          className,
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        )}
        {...props}
      >
        <Spinner size={size} strokeWidth={strokeWidth} color={color} />
      </div>
    );
  }

  return <Spinner className={className} size={size} strokeWidth={strokeWidth} color={color} />;
};

export default LoadingSpinner;
