import React from 'react';
import classNames from 'classnames';

interface CardProps {
  className?: string;
}
const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={classNames(
        'bg-surface-0 shadow-lg flex flex-col p-5 rounded-lg text-high border border-element-10',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;
