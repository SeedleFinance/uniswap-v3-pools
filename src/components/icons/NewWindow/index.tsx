import React from 'react';

interface IconProps {
  className?: string;
}

const IconNewWindow: React.FC<IconProps> = ({ className }) => {
  return (
    <div className={className}>
      <svg
        fill="none"
        height="16"
        viewBox="0 0 16 16"
        width="16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.2">
          <path d="m6 3h-3v10h10v-3" />
          <path d="m12.5 3.5-5 5.5" />
          <path d="m9.5 3h3.5v3.5" />
        </g>
      </svg>
    </div>
  );
};

export default IconNewWindow;
