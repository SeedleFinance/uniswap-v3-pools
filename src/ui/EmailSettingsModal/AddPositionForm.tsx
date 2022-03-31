import React, { ChangeEvent } from "react";
import { Button } from "../Button";

interface AddPositionFormProps {
  onSubmit(e: React.FormEvent<HTMLFormElement>): void;
  onCancel(): void;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
  account: string;
  email: string;
}

const AddPositionForm: React.FC<AddPositionFormProps> = ({
  onChange,
  onCancel,
  onSubmit,
  account,
  email,
}) => (
  <form onSubmit={onSubmit} action="/" className="flex mt-3 flex-col">
    <label className="py-1">Account address:</label>
    <input
      className="text-lg border text-slate-600 dark:text-white bg-white dark:bg-slate-600 p-2 dark:border-slate-700 rounded-md focus:outline-none focus:border-slate-800 dark:focus:border-slate-400"
      type="text"
      name="account"
      placeholder="Account address or ENS name"
      value={account}
      onChange={onChange}
    />
    <label className="mt-4 py-1">Your email:</label>
    <input
      className="text-lg border text-slate-600 dark:text-white bg-white dark:bg-slate-600 p-2 border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-slate-800 dark:focus:border-slate-400"
      type="text"
      name="email"
      placeholder="Your email"
      value={email}
      onChange={onChange}
    />
    <div className="flex mt-6 justify-end">
      <Button onClick={onCancel} type="button">
        Cancel
      </Button>
      <Button
        type="submit"
        className="bg-slate-200 border border-slate-300 dark:text-slate-600 px-4 ml-2"
      >
        Save
      </Button>
    </div>
  </form>
);

export default AddPositionForm;
