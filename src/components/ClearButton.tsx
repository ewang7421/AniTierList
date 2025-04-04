import { useLoadedUser } from "@/context/LoadedUserContext";
import { Button } from "@chakra-ui/react";

export const ClearButton = () => {
  const { setTierListModel } = useLoadedUser();
  return (
    // TODO: fix this styling
    <Button
      colorPalette={"red"}
      variant={"subtle"}
      onClick={() =>
        setTierListModel((prev) => {
          const newTiers = prev.tiers.map((tier) => ({ ...tier, entries: [] }));
          const newInventory = {
            ...prev.inventory,
            entries: [
              ...prev.inventory.entries,
              ...prev.tiers.map((tier) => tier.entries).flat(),
            ].sort((a, b) => a.title.localeCompare(b.title)),
          };
          return { ...prev, inventory: newInventory, tiers: newTiers };
        })
      }
    >
      Clear
    </Button>
  );
};
