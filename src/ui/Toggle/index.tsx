import React from 'react';

interface Props {
  label: string;
  onChange: () => void;
  checked: boolean;
}

function Toggle({ label, onChange, checked }: Props) {
  return (
    <label className="flex items-center cursor-pointer text-0.875">
      <style
        dangerouslySetInnerHTML={{
          __html: `.toggle-checkbox:checked ~ .dot { transform: translateX(75%); background-color: #fff; }`,
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
          className={`w-9 h-6 rounded-full shadow-inner ${
            checked ? 'bg-blue-primary' : 'bg-surface-40'
          }`}
        ></div>
        <div className="dot absolute w-4 h-4 bg-white rounded-full shadow left-1 top-1 transition"></div>
      </div>
      <div className="ml-3 text-medium">{label}</div>
    </label>
  );
}

export default Toggle;
