import React from 'react';
import classNames from 'classnames';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}
const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={classNames(
        'shadow-md bg-surface-0 flex flex-col p-4 w-full md:w-auto rounded-lg text-high',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;
