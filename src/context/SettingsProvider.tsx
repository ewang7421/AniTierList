import { Settings } from "@/types/types";
import { SettingsContext } from "./SettingsContext";
import React, { ReactNode, useState } from "react";
import { defaultEntrySize } from "@/config/sizes";

export interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const cachedSettings: Settings | null = JSON.parse(
  window.localStorage.getItem("settings") || "null"
);
const defaultSettings: Settings = {
  dropDownSelected: null,
  entrySize: defaultEntrySize,
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(
    cachedSettings || defaultSettings
  );
  const _setSettings = (settings: Settings) => {
    setSettings(settings);
    // TODO: figure out if this pattern is best for settings.
    // do we wrap the set callback with a modification to localstorage?
    // or do we rewrite it every time
    window.localStorage.setItem("settings", JSON.stringify(settings));
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
