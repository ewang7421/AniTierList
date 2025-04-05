import React, { ReactNode, useState } from "react";
import { TierListModel, User, ListWebsite } from "@/types/types";
import { LoadedUserContext } from "./LoadedUserContext";
import { loadUserList } from "@/services/userListService";
export interface LoadedUserContextType {
  loadedUser: User | null;
  loadUser: (
    site: ListWebsite,
    username: string,
    setTierListModelCallback: React.Dispatch<
      React.SetStateAction<TierListModel>
    >
  ) => Promise<void>;
}
const cachedLoadedUser: User | null = JSON.parse(
  window.localStorage.getItem("AniTierList:Dashboard:loadedUser") || "null"
) as User | null;

export const LoadedUserProvider = ({ children }: { children: ReactNode }) => {
  const [loadedUser, setLoadedUser] = useState<User | null>(cachedLoadedUser); // TODO: have some warning telling user that we will reset the state of the tierlist

  const loadUser = (
    site: ListWebsite,
    username: string,
    setTierListModelCallback: React.Dispatch<
      React.SetStateAction<TierListModel>
    >
  ) => {
    return loadUserList(
      site,
      username,
      setLoadedUser,
      setTierListModelCallback
    );
  };
  return (
    <LoadedUserContext.Provider
      value={{
        loadedUser,
        loadUser,
      }}
    >
      {children}
    </LoadedUserContext.Provider>
  );
};
