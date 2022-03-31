import React from "react";
import Icon from "../Icon";

import { Position } from "../../AppSettingsProvider";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../Button";

interface OpenPositionProps {
  position: Position;
  onDelete(id: string): void;
}

const OpenPosition: React.FC<OpenPositionProps> = ({ position, onDelete }) => {
  const [showButtons, setShowButtons] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);

  const [account, setAccount] = React.useState(position.account);
  const [email, setEmail] = React.useState(position.email);

  function handleMouseEnter() {
    setShowButtons(true);
  }

  function handleMouseLeave() {
    setShowButtons(false);
  }

  function handleClickEdit() {
    setEditMode(true);
  }

  function handleCancelEdit() {
    setEditMode(false);
  }

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const field = e.target.name;
    switch (field) {
      case "email":
        setEmail(e.target.value);
        break;

      case "account":
        setAccount(e.target.value);
        break;
    }
  }

  // todo
  function handleUpdatePosition() {}

  if (!editMode) {
    return (
      <div
        className="flex flex-col mt-3 border rounded-md p-3 dark:border-slate-500 cursor-pointer relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showButtons && (
          <div className="flex absolute bottom-5 right-4">
            <div onClick={handleClickEdit}>
              <Icon size="sm" className="" icon={faPencil} />
            </div>
            <div className="ml-4" onClick={() => onDelete(position.id)}>
              <Icon size="sm" className="" icon={faTrash} />
            </div>
          </div>
        )}
        <div className="flex flex-col">
          <div>{position.account}</div>
          <div className="text-sm text-slate-400">
            {new Date(position.time).toISOString().slice(0, 10)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col ">
      <div className="flex flex-col p-2 border border-slate-300 mt-2 rounded-md">
        <label className="py-1 text-sm">Account address:</label>
        <input
          className="text-sm border text-slate-600 dark:text-white bg-white dark:bg-slate-600 p-2 dark:border-slate-700 rounded-md focus:outline-none focus:border-slate-800 dark:focus:border-slate-400"
          type="text"
          name="account"
          placeholder="Account address or ENS name"
          value={account}
          onChange={handleOnChange}
        />
        <label className="mt-2 text-sm">Your email:</label>
        <input
          className="text-sm border text-slate-600 dark:text-white bg-white dark:bg-slate-600 p-2 border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-slate-800 dark:focus:border-slate-400"
          type="text"
          name="email"
          placeholder="Your email"
          value={email}
          onChange={handleOnChange}
        />
        <div className="flex mt-2">
          <Button onClick={handleCancelEdit} type="button" className="text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePosition}
            type="button"
            className="ml-2 text-xs"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpenPosition;
