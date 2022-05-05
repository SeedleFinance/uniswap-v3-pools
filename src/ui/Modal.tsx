import React, { useRef, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Icon from './Icon';
import { UnstyledButton } from './Button';

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
      className="fixed inset-0 h-screen flex flex-col items-center justify-center"
      onKeyUp={handleKeyup}
    >
      <div className="fixed h-screen w-full bg-slate-300 bg-opacity-75"></div>

      <div
        ref={containerEl}
        tabIndex={0}
        className={`w-1/2 max-w-screen-sm bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-md p-4 z-10 rounded-lg focus:outline-none ${className}`}
      >
        <header className="flex flex-row justify-between items-start pb-3">
          <h2 className="text-2xl">{title}</h2>
          {onClose && (
            <UnstyledButton onClick={() => onClose(false)}>
              <Icon icon={faTimesCircle} />
            </UnstyledButton>
          )}
        </header>
        {children}
      </div>
    </div>,
    themeWrapperEl as HTMLElement,
  );
};

export default Modal;
