import { Flex } from "@chakra-ui/react";
import { Entry } from "@/Entry";
import { InventoryModel } from "./types";

interface InventoryProps {
  inventory: InventoryModel;
}

export const Inventory = ({ inventory }: InventoryProps) => {
  return (
    <Flex flexWrap="wrap">
      {inventory.entries &&
        Array.from(inventory.entries).map((entry) => (
          <Entry key={entry.id} entry={entry} />
        ))}
    </Flex>
  );
};
