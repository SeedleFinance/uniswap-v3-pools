import React from 'react';

interface Props {
  label: string;
  onChange: () => void;
  checked: boolean;
}

function Toggle({ label, onChange, checked }: Props) {
  return (
    <label className="flex items-center cursor-pointer">
      <style
        dangerouslySetInnerHTML={{
          __html: `.toggle-checkbox:checked ~ .dot { transform: translateX(100%); background-color: #10B981; }`,
        }}
      ></style>

      <div className="relative">
        <input
          type="checkbox"
          className="toggle-checkbox sr-only"
          onChange={() => onChange()}
          checked={checked}
        />
        <div
          className={`w-10 h-4 rounded-full shadow-inner ${
            checked ? 'bg-green-400' : 'bg-gray-400'
          }`}
        ></div>
        <div className="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition"></div>
      </div>
      <div className="ml-3 text-gray-700 dark:text-gray-200">{label}</div>
    </label>
  );
}

export default Toggle;
