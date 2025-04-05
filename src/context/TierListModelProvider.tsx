import { TierListModel } from "@/types/types";
import { TierModelContext } from "@/context/TierListModelContext";

import { ReactNode, useState } from "react";
import { default_tiers } from "@/config/tiers";
import { defaultScoreFormat } from "@/types/scoreFormat";

export interface TierListModelContextType {
  tierListModel: TierListModel;
  setTierListModel: React.Dispatch<React.SetStateAction<TierListModel>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultTierListModel = {
  scoreFormat: defaultScoreFormat,
  inventory: { entries: [] },
  tiers: default_tiers,
};

export const TierListModelProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tierListModel, setTierListModel] = useState<TierListModel>(
    JSON.parse(
      window.localStorage.getItem("AniTierList:Dashboard:TierListModel") ||
        "null"
    ) || defaultTierListModel
  );

  return (
    <TierModelContext.Provider
      value={{ tierListModel, setTierListModel, isLoading, setIsLoading }}
    >
      {children}
    </TierModelContext.Provider>
  );
};
