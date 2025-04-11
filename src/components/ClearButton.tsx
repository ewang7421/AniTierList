import { useTierListModel } from "@/context/TierListModelContext";
import { Button } from "@chakra-ui/react";
import { clearTierListModel } from "@/utils/TierListModelUtils";

export const ClearButton = () => {
  const { setTierListModel } = useTierListModel();
  return (
    // TODO: fix this styling
    <Button
      colorPalette={"red"}
      variant={"subtle"}
      onClick={() => setTierListModel((prev) => clearTierListModel(prev))}
    >
      Clear
    </Button>
  );
};
