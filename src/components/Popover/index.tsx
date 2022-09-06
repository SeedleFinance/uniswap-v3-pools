import React from 'react';
import createPersistedState from 'use-persisted-state';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import IconClose from '../../components/icons/Close';

import styles from './styles.module.css';

interface Props {
  title: String;
  description: string;
  href: string;
  className?: string;
}

const usePopoverState: any = createPersistedState('popover');

const Popover = ({ title, description, className, href }: Props) => {
  const themeWrapperEl = document.getElementById('theme-wrapper');
  const [showPopover, setShowPopover] = usePopoverState(true);

  if (!themeWrapperEl) {
    return null;
  }

  function handleClickClose() {
    setShowPopover(false);
  }

  return ReactDOM.createPortal(
    <div className="fixed right-12 bottom-8 ">
      {showPopover && (
        <div className={classNames('flex flex-col', styles.popover)}>
          <div className="fixed h-screen w-full bg-opacity-0"></div>
          <div
            className={`relative bg-surface-0 shadow-md border-element-10 p-8 pt-6 z-10 rounded-md focus:outline-none ${className}`}
          >
            <button
              onClick={handleClickClose}
              className="absolute right-2 top-2 w-6 h-6 flex justify-center items-center hover:bg-surface-5 rounded-sm flex-shrink-0 p-1 text-medium"
            >
              <IconClose />
            </button>

            <h2 className="text-1 font-semibold text-high py-1">{title}</h2>
            <p className="text-0.875 text-medium">{description}</p>
            <div className="mt-2">
              <a
                href={href}
                target="_blank"
                className="text-0.8125 font-medium text-blue-primary border-b border-blue-light"
                rel="noreferrer"
              >
                Contribute
              </a>
            </div>
          </div>
        </div>
      )}
    </div>,
    themeWrapperEl as HTMLElement,
  );
};

export default Popover;
