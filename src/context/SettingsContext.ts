import { createContext, useContext } from "react";
import { SettingsContextType } from "./SettingsProvider";
export const SettingsContext = createContext<SettingsContextType | null>(null);
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("Settings must be used within a SettingsProvider");
  }
  return context;
};
