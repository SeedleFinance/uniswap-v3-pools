import classNames from 'classnames';
import React from 'react';

interface IconProps {
  color?: string;
  className?: string;
}

const Warning: React.FC<IconProps> = ({ className, color }) => {
  return (
    <div className={classNames('bg-surface-40 rounded-full text-inverted', className)}>
      <svg
        fill="none"
        height="17"
        viewBox="0 0 16 17"
        width="16"
        xmlns="http://www.w3.org/2000/svg"
        color={color}
      >
        <circle cx="8" cy="8.5" r="8" />
        <path
          d="m9.09332 4.27271-.16619 6.11079h-1.55966l-.17046-6.11079zm-.94602 8.83809c-.28125 0-.52273-.0995-.72443-.2983-.20171-.2017-.30114-.4432-.2983-.7245-.00284-.2784.09659-.517.2983-.7159.2017-.1988.44318-.2983.72443-.2983.26988 0 .5071.0995.71165.2983.20454.1989.30823.4375.31108.7159-.00285.1875-.05256.3594-.14915.5157-.09375.1534-.21733.277-.37074.3707-.15341.0909-.32102.1364-.50284.1364z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default Warning;
