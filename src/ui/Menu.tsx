import React, { useEffect, useRef, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className: string;
  onClose: () => void;
}

function Menu({ children, className, onClose }: Props) {
  const wrapperEl = useRef(null);

  useEffect(() => {
    const handler = (ev: any) => {
      if (wrapperEl.current && !wrapperEl.current.contains(ev.target)) {
        onClose();
      }
    };

    document.body.addEventListener("click", handler, true);
    return function cleanup() {
      document.body.removeEventListener("click", handler, true);
    };
  }, []);

  return (
    <div
      ref={wrapperEl}
      className={`absolute z-50 p-2 rounded-md border border-slate-200 dark:border-slate-700  bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 flex flex-col ${className}`}
    >
      {children}
    </div>
  );
}

export default Menu;
