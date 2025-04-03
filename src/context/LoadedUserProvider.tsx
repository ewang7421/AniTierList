import React, { ReactNode, useState } from "react";
import { TierListModel, User, ListWebsite, TierModel } from "@/types/types";
import { getList } from "@/api/api";
import { LoadedUserContext } from "./LoadedUserContext";
import { ScoreFormat } from "@/types/scoreFormat";
export interface LoadedUserContextType {
  loadedUser: User | null;
  loadUserList: (site: ListWebsite, username: string) => Promise<void>;
  tierListModel: TierListModel;
  setTierListModel: React.Dispatch<React.SetStateAction<TierListModel>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  default_tiers_map: Map<ScoreFormat, TierModel[]>;
}
const cachedLoadedUser: User | null = JSON.parse(
  window.localStorage.getItem("AniTierList:Dashboard:loadedUser") || "null"
) as User | null;

const default_tiers_map = new Map<ScoreFormat, TierModel[]>([
  [
    ScoreFormat.POINT_100,
    [
      { entries: [], name: "SSS", minScore: 8.5, maxScore: 100 },
      { entries: [], name: "SS", minScore: 8.5, maxScore: 90 },
      { entries: [], name: "S", minScore: 8.5, maxScore: 80 },
      { entries: [], name: "A", minScore: 7, maxScore: 70 },
      { entries: [], name: "B", minScore: 5.5, maxScore: 60 },
      { entries: [], name: "C", minScore: 4, maxScore: 50 },
      { entries: [], name: "D", minScore: 2.5, maxScore: 40 },
      { entries: [], name: "E", minScore: 1, maxScore: 30 },
      { entries: [], name: "F", minScore: 1, maxScore: 20 },
      { entries: [], name: "TRASH", minScore: 1, maxScore: 10 },
    ],
  ],
  [
    ScoreFormat.POINT_10_DECIMAL,
    [
      { entries: [], name: "SSS", minScore: 8.5, maxScore: 10.0 },
      { entries: [], name: "SS", minScore: 8.5, maxScore: 9.0 },
      { entries: [], name: "S", minScore: 8.5, maxScore: 8.0 },
      { entries: [], name: "A", minScore: 7, maxScore: 7.0 },
      { entries: [], name: "B", minScore: 5.5, maxScore: 6.0 },
      { entries: [], name: "C", minScore: 4, maxScore: 5.0 },
      { entries: [], name: "D", minScore: 2.5, maxScore: 4.0 },
      { entries: [], name: "E", minScore: 1, maxScore: 3.0 },
      { entries: [], name: "F", minScore: 1, maxScore: 2.0 },
      { entries: [], name: "TRASH", minScore: 1, maxScore: 1.0 },
    ],
  ],
  [
    ScoreFormat.POINT_10,
    [
      { entries: [], name: "SSS", minScore: 8.5, maxScore: 10 },
      { entries: [], name: "SS", minScore: 8.5, maxScore: 9 },
      { entries: [], name: "S", minScore: 8.5, maxScore: 8 },
      { entries: [], name: "A", minScore: 7, maxScore: 7 },
      { entries: [], name: "B", minScore: 5.5, maxScore: 6 },
      { entries: [], name: "C", minScore: 4, maxScore: 5 },
      { entries: [], name: "D", minScore: 2.5, maxScore: 4 },
      { entries: [], name: "E", minScore: 1, maxScore: 3 },
      { entries: [], name: "F", minScore: 1, maxScore: 2 },
      { entries: [], name: "TRASH", minScore: 1, maxScore: 1 },

      /*


      S: 9.5-10
      A: 8.5-9.5
      B: 7-8.5
      C: 6-7
      D: 5-6
      F: 0-5 

      */
    ],
  ],
  [
    ScoreFormat.POINT_5,
    [
      { entries: [], name: "S", minScore: 8.5, maxScore: 5 },
      { entries: [], name: "A", minScore: 8.5, maxScore: 4 },
      { entries: [], name: "B", minScore: 8.5, maxScore: 3 },
      { entries: [], name: "C", minScore: 7, maxScore: 2 },
      { entries: [], name: "F", minScore: 5.5, maxScore: 1 },
    ],
  ],
  [
    ScoreFormat.POINT_3,
    [
      { entries: [], name: ":)", minScore: 8.5, maxScore: 3 },
      { entries: [], name: ":|", minScore: 8.5, maxScore: 2 },
      { entries: [], name: ":(", minScore: 8.5, maxScore: 1 },
    ],
  ],
]);

const starting_default_tiers = [
  { entries: [], name: "SSS", minScore: 8.5, maxScore: 100 },
  { entries: [], name: "SS", minScore: 8.5, maxScore: 90 },
  { entries: [], name: "S", minScore: 8.5, maxScore: 80 },
  { entries: [], name: "A", minScore: 7, maxScore: 70 },
  { entries: [], name: "B", minScore: 5.5, maxScore: 60 },
  { entries: [], name: "C", minScore: 4, maxScore: 50 },
  { entries: [], name: "D", minScore: 2.5, maxScore: 40 },
  { entries: [], name: "E", minScore: 1, maxScore: 30 },
  { entries: [], name: "F", minScore: 1, maxScore: 20 },
  { entries: [], name: "TRASH", minScore: 1, maxScore: 10 },
];

const cachedTierListModel: TierListModel | null = JSON.parse(
  window.localStorage.getItem("AniTierList:Dashboard:TierListModel") || "null"
) as TierListModel | null;
export const LoadedUserProvider = ({ children }: { children: ReactNode }) => {
  const [loadedUser, setLoadedUser] = useState<User | null>(cachedLoadedUser); // TODO: have some warning telling user that we will reset the state of the tierlist
  const [tierListModel, setTierListModel] = useState<TierListModel>(
    cachedTierListModel || {
      scoreFormat: null,
      inventory: { entries: [] },
      tiers: starting_default_tiers,
    }
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loadUserList = async (site: ListWebsite, username: string) => {
    if (username.trim().length < 2) {
      throw Error("Username must be at least 2 characters");
    }
    if (tierListModel.tiers.some((tierModel) => tierModel.entries.length > 0)) {
      //TODO:
      console.log("send warning that tiers will be reset");
    }
    try {
      const listData = await getList(site, username);
      const user = listData.user;
      const completedList = listData.completedList;

      setLoadedUser(user);

      if (completedList) {
        setTierListModel((prev) => {
          const newTiers = structuredClone(
            default_tiers_map.get(user.scoreFormat)
          );
          console.log(default_tiers_map);
          console.log(user.scoreFormat);
          console.log("newTiers before pushing: ", newTiers);
          if (newTiers === undefined) {
            throw Error("fatal error when loading list");
          }
          newTiers.sort((a, b) => b.maxScore - a.maxScore);
          console.log(newTiers.length);
          const newInventory = {
            ...prev.inventory,
            entries: completedList.filter(
              (entry) => entry.score < newTiers[newTiers.length - 1].maxScore
            ),
          };
          for (const entry of completedList) {
            //TODO: right now, minscore is being used as maxscore.
            const tier = newTiers.find((tier) => entry.score >= tier.maxScore);
            tier?.entries.push(entry);
          }

          console.log("result: ", {
            ...prev,
            tiers: newTiers,
            inventory: newInventory,
          });
          return {
            ...prev,
            tiers: newTiers,
            inventory: newInventory,
          };
        });
      }
    } catch (error) {
      //TODO: this console error is only to prevent eslint error
      console.error(error);
      throw error;
    }
  };
  return (
    <LoadedUserContext.Provider
      value={{
        loadedUser,
        loadUserList,
        tierListModel,
        setTierListModel,
        isLoading,
        setIsLoading,
        default_tiers_map,
      }}
    >
      {children}
    </LoadedUserContext.Provider>
  );
};
