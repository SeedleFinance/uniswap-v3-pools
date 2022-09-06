import { Fragment } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import Button from '../Button';

interface DropdownMenuProps {
  children?: React.ReactNode;
  options: {
    label: React.ReactNode;
    icon?: React.ReactNode;
    href?: string;
    cb?: () => void;
  }[];
  className?: string;
}

function DropdownMenu({ children, options, className }: DropdownMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {children && (
        <div>
          <Menu.Button className="inline-flex justify-center">{children}</Menu.Button>
        </div>
      )}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={classNames(
            'origin-top-right absolute  py-1 right-0 mt-1 w-44 rounded-md shadow-lg bg-surface-0 ring-1 ring-element-10 focus:outline-none z-50',
            className!,
          )}
          static
        >
          {options.map((option) => (
            <Menu.Item key={option.label!.toString()}>
              {option.href ? (
                <Link href={option.href}>
                  <a className="px-4 py-2 flex !justify-start items-center w-full text-sm text-high hover:bg-surface-10 !rounded-none">
                    <span className="w-4 h-4 text-medium mr-2">{option.icon}</span>
                    <span className="text-0.8125">{option.label}</span>
                  </a>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  onClick={option.cb}
                  className="px-4 py-2 flex !justify-start items-center w-full text-sm text-high hover:bg-surface-10 !rounded-none"
                >
                  <span className="w-4 h-4 text-medium mr-2">{option.icon}</span>
                  <span className="text-0.8125">{option.label}</span>
                </Button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default DropdownMenu;
