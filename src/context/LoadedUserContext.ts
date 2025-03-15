import { createContext, useContext } from "react";
import { LoadedUserContextType } from "./LoadedUserProvider";

export const LoadedUserContext = createContext<LoadedUserContextType | null>(
  null
);
export const useLoadedUser = () => {
  const context = useContext(LoadedUserContext);
  if (!context) {
    throw new Error("useLoadedUser must be used within a UserProvider");
  }
  return context;
};
