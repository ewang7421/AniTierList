import { Settings } from "@/types/types";
import { SettingsContext } from "./SettingsContext";
import React, { ReactNode, useEffect, useState } from "react";
import { defaultEntrySize, defaultPageSize } from "@/config/sizes";

export interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const cachedSettings: Settings | null = JSON.parse(
  window.localStorage.getItem("settings") || "null"
);

const defaultSettings: Settings = {
  entrySize: defaultEntrySize,
  inventoryPageSize: defaultPageSize,
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(
    cachedSettings || defaultSettings
  );
  useEffect(() => {
    window.localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);
  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
