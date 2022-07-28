import React from 'react';
import { Link } from 'react-router-dom';
import IconClose from '../../icons/Close';

interface Props {
  title: String;
  description: string;
  href: string;
  className?: string;
  onClose: () => void;
}

const Popover = ({ title, description, className, href, onClose }: Props) => {
  return (
    <div className="fixed opacity-0 md:opacity-100 right-12 bottom-8 transition-opacity">
      <div className="flex flex-col w-80">
        <div className="fixed h-screen w-full bg-opacity-0"></div>
        <div
          className={`relative bg-surface-0 shadow-md border-element-10 p-8 pt-6 z-10 rounded-md focus:outline-none ${className}`}
        >
          <button
            onClick={onClose}
            className="absolute right-2 top-2 w-6 h-6 flex justify-center items-center hover:bg-slate-50 rounded-sm flex-shrink-0 p-1 text-medium"
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
    </div>
  );
};

export default Popover;
