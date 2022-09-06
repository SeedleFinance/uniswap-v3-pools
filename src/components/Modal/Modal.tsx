import React, { useRef, ReactNode } from 'react';
import ReactDOM from 'react-dom';
// import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
// import Icon from '../Icon/Icon';
import Button from '../Button';

interface Props {
  children: ReactNode;
  title: ReactNode;
  className?: string;
  onClose?: (success: boolean) => void;
}

const Modal = ({ title, children, className, onClose }: Props) => {
  const containerEl = useRef(null);

  const handleKeyup = (ev: { target: any; keyCode: number }) => {
    if (onClose && ev.target === containerEl.current && ev.keyCode === 27) {
      onClose(false);
    }
  };

  const themeWrapperEl = document.getElementById('theme-wrapper');

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 h-screen flex flex-col items-center justify-center p-4 z-50"
      onKeyUp={handleKeyup}
    >
      <div className="fixed h-screen w-full bg-slate-800 bg-opacity-75"></div>
      <div
        ref={containerEl}
        tabIndex={0}
        className={`w-full md:w-1/2 max-w-screen-sm bg-surface-5 shadow-md p-4 md:p-12 z-10 rounded-lg focus:outline-none ${className}`}
      >
        <header className="flex flex-row justify-between items-start pb-3">
          <h2 className="text-1.75 font-bold text-high">{title}</h2>
          {onClose && (
            <Button variant="ghost" onClick={() => onClose(false)}>
              {/* <Icon icon={faTimesCircle} /> */}
              todo
            </Button>
          )}
        </header>
        {children}
      </div>
    </div>,
    themeWrapperEl as HTMLElement,
  );
};

export default Modal;
