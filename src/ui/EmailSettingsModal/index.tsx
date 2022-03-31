import React, { useState } from "react";

import { useAddress } from "../../AddressProvider";
import { Position, useAppSettings } from "../../AppSettingsProvider";

import { Button } from "../Button";
import Modal from "../Modal";
import AddPositionForm from "./AddPositionForm";
import OpenPosition from "./OpenPosition";

interface ModalProps {
  onSubmit(): void;
  onCancel(): void;
}

const EmailSettingsModal: React.FC<ModalProps> = ({ onSubmit, onCancel }) => {
  const { injectedAddress } = useAddress();

  const [email, setEmail] = useState("");
  const [account, setAccount] = useState(injectedAddress || "");
  const [showPositionsForm, setShowPositionsForm] = React.useState(false);

  const { openPositions, addPosition, removePosition } = useAppSettings();

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

  async function handleSubmit() {
    const response = await addPosition({
      account,
      email,
    });

    if (response.error) {
      console.log(response.error);
    }

    clearForm();
  }

  async function handleDeletePosition(id: string) {
    const response = await removePosition(id);

    if (response.error) {
      console.log(response.error);
    }
  }

  function handleOnCancel() {
    clearForm();
    onCancel();
  }

  function clearForm() {
    setEmail("");
    setAccount("");
  }

  return (
    <Modal
      title={`Watch positions (${openPositions.length})`}
      className="dark:text-white"
    >
      <>
        <div className="dark:text-slate-300 pr-12">
          Add an account address and email below, to get notified when an
          accounts position goes out of range.
        </div>
        {!openPositions.length ? (
          <AddPositionForm
            account={account}
            email={email}
            onChange={handleOnChange}
            onSubmit={handleSubmit}
            onCancel={handleOnCancel}
          />
        ) : (
          <div className="flex flex-col">
            <div className="relative overflow-y-auto max-h-80">
              <div>
                {openPositions.map((position: Position, i) => (
                  <OpenPosition
                    position={position}
                    key={`${position.account}-${i}`}
                    onDelete={handleDeletePosition}
                  />
                ))}
              </div>
            </div>
            <div className="mt-2">
              {!showPositionsForm ? (
                <div className="flex justify-end mt-2">
                  <Button onClick={handleOnCancel}>Cancel</Button>
                  <Button
                    onClick={() => setShowPositionsForm(true)}
                    className="bg-slate-200 border border-slate-300 dark:text-slate-600 px-4 ml-2"
                  >
                    + Add Position
                  </Button>
                </div>
              ) : (
                <AddPositionForm
                  account={account}
                  email={email}
                  onChange={handleOnChange}
                  onSubmit={handleSubmit}
                  onCancel={handleOnCancel}
                />
              )}
            </div>
          </div>
        )}
      </>
    </Modal>
  );
};

export default EmailSettingsModal;
