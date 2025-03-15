import React, { ReactNode, useState } from "react";
import { TierListModel, User, ListWebsite, TierModel } from "@/types/types";
import { getList } from "@/api/api";
import { LoadedUserContext } from "./LoadedUserContext";
export interface LoadedUserContextType {
  loadedUser: User | null;
  loadUserList: (site: ListWebsite, username: string) => Promise<void>;
  tierListModel: TierListModel;
  setTierListModel: React.Dispatch<React.SetStateAction<TierListModel>>;
}
const cachedLoadedUser: User | null = JSON.parse(
  window.localStorage.getItem("AniTierList:Dashboard:loadedUser") || "null"
) as User | null;

const cachedTierListModel: TierListModel | null = JSON.parse(
  window.localStorage.getItem("AniTierList:Dashboard:TierListModel") || "null"
) as TierListModel | null;
export const LoadedUserProvider = ({ children }: { children: ReactNode }) => {
  const [loadedUser, setLoadedUser] = useState<User | null>(cachedLoadedUser); // TODO: have some warning telling user that we will reset the state of the tierlist
  const [tierListModel, setTierListModel] = useState<TierListModel>(
    cachedTierListModel || {
      inventory: { entries: [] },
      tiers: [
        // the inventory is at index 0
        { entries: [], name: "A", minScore: 8, maxScore: 9 },
        { entries: [], name: "B", minScore: 6, maxScore: 7 },
        { entries: [], name: "C", minScore: 4, maxScore: 5 },
        { entries: [], name: "D", minScore: 2, maxScore: 3 },
        { entries: [], name: "F", minScore: 0, maxScore: 1 },
      ],
    }
  );
  const loadUserList = async (site: ListWebsite, username: string) => {
    if (username.trim().length < 2) {
      throw Error("Username must be at least 2 characters");
    }
    if (tierListModel.tiers.some((tierModel) => tierModel.entries.length > 0)) {
      console.log("send warning that tiers will be reset");
    }
    try {
      const { completedList, user } = await getList(site, username); // Set the state with the fetched data
      // Set the tier list model's inventory to the fetched anime list

      if (completedList) {
        setTierListModel((prev) => ({
          ...prev,
          tiers: prev.tiers.map((prevTier: TierModel) => ({
            ...prevTier,
            entries: [],
          })),
          inventory: {
            ...prev.inventory,
            entries: completedList,
          },
        }));
      }

      if (user) {
        setLoadedUser(user);
      }
    } catch (error) {
      //TODO: this console error is only to prevent eslint error
      console.error(error);
      throw error;
    }
  };
  return (
    <LoadedUserContext.Provider
      value={{ loadedUser, loadUserList, tierListModel, setTierListModel }}
    >
      {children}
    </LoadedUserContext.Provider>
  );
};
