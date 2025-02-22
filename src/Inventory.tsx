import { Flex } from "@chakra-ui/react";
import { Entry } from "@/Entry";
import { InventoryModel, TierListEntry } from "./types";

interface InventoryProps {
  inventory: InventoryModel;
  handleDragStart: (entry: TierListEntry, tierIndex: number) => void;
  handleDragOver: (
    event: React.DragEvent<HTMLDivElement>,
    tierIndex: number,
    entryIndex: number
  ) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

export const Inventory = ({
  inventory,
  handleDragStart,
  handleDragOver,
  handleDrop,
}: InventoryProps) => {
  return (
    <Flex
      flexWrap="wrap"
      onDragOver={(e) => {
        handleDragOver(e, 0, inventory.entries.length);
      }}
      onDrop={handleDrop}
    >
      {inventory.entries &&
        Array.from(inventory.entries).map((entry, entryIndex) => (
          <Entry
            key={entry.id}
            entry={entry}
            tierIndex={0}
            entryIndex={entryIndex}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
          />
        ))}
    </Flex>
  );
};
