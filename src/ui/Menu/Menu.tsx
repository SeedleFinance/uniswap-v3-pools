import React, { useEffect, useRef, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  onClose: () => void;
}

function Menu({ children, className, onClose }: Props) {
  const wrapperEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (ev: any) => {
      if (wrapperEl.current && !wrapperEl.current.contains(ev.target)) {
        onClose();
      }
    };

    document.body.addEventListener('click', handler, true);
    return function cleanup() {
      document.body.removeEventListener('click', handler, true);
    };
  }, [onClose]);

  return (
    <div
      ref={wrapperEl}
      className={`absolute z-50 p-2 rounded-md border bg-surface-0 border-element-10 text-high flex flex-col ${className}`}
    >
      {children}
    </div>
  );
}

export default Menu;
