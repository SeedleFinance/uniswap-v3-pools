import React, { ReactNode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

export enum AlertLevel {
  Success,
  Warning,
  Error,
}

interface Props {
  level: AlertLevel;
  children: ReactNode;
  onHide: () => void;
}

const Alert = ({ children, level, onHide }: Props) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, [setShow]);

  let levelColors = 'text-green-800 bg-green-200 border-green-400';
  if (level === AlertLevel.Warning) {
    levelColors = 'text-orange-800 bg-orange-200 border-orange-400';
  } else if (level === AlertLevel.Error) {
    levelColors = 'text-red-800 bg-red-200 border-red-400';
  }

  const scheduleHide = () => {
    window.setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  return ReactDOM.createPortal(
    <CSSTransition
      in={show}
      timeout={2000}
      classNames="alert"
      onEntered={scheduleHide}
      onExited={onHide}
    >
      <div
        className={`fixed z-50 top-0 right-0 mt-4 mr-4 border border-solid p-4 rounded shadow-sm select-none ${levelColors}`}
      >
        {children}
      </div>
    </CSSTransition>,
    document.body,
  );
};

export default Alert;
