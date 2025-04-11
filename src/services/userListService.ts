// src/services/tierListService.ts

import { getList } from "@/api/api"; // API function to fetch data
import { default_tiers_map } from "@/config/tiers";
import { User, TierListModel, ListWebsite } from "@/types/types";

export const loadUserList = async (
  site: ListWebsite,
  username: string,
  setUserCallback: React.Dispatch<React.SetStateAction<User | null>>,
  setTierListModelCallback: React.Dispatch<React.SetStateAction<TierListModel>>
) => {
  try {
    const listData = await getList(site, username);
    const user = listData.user;
    const completedList = listData.completedList;

    setUserCallback(user);

    if (completedList) {
      setTierListModelCallback((prev) => {
        if (username.trim().length < 2) {
          throw Error("Username must be at least 2 characters");
        }
        if (prev.tiers.some((prev) => prev.entries.length > 0)) {
          //TODO:
          console.log("send warning that tiers will be reset");
        }
        const newTiers = structuredClone(
          default_tiers_map.get(user.scoreFormat)
        );
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
