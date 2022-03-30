import React from "react";
import { useAppSettings } from "./AppSettingsProvider";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import Icon from "./ui/Icon";

const Email = () => {
  const { setShowPositionsModal } = useAppSettings();

  function handleToggleModal() {
    setShowPositionsModal((prev) => !prev);
  }
  return (
    <button
      className="p-2 rounded-md border w-12 h-12 focus:outline-none border-slate-200 dark:border-slate-700 focus:border-slate-400 text-slate-800 dark:text-slate-100 flex justify-center items-center flex-shrink-0 ml-2"
      onClick={handleToggleModal}
    >
      <Icon className="" icon={faBell} />
    </button>
  );
};

export default Email;
