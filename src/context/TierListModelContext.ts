import { createContext, useContext } from "react";
import { TierListModelContextType } from "./TierListModelProvider";

export const TierModelContext = createContext<TierListModelContextType | null>(
  null
);
export const useTierListModel = () => {
  const context = useContext(TierModelContext);
  if (!context) {
    throw new Error(
      "useTierListModel must be used within a TierListModelProvider"
    );
  }
  return context;
};
