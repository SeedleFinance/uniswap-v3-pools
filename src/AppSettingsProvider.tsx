import React, { ReactNode, useContext, useState } from "react";

const AppSettingsContext = React.createContext(null as any);
export const useAppSettings = () => useContext(AppSettingsContext);

interface Props {
  children: ReactNode;
}

export const AppSettingsProvider = ({ children }: Props) => {
  const [filterClosed, setFilterClosed] = useState(false);

  return (
    <AppSettingsContext.Provider
      value={{
        filterClosed,
        setFilterClosed,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};
