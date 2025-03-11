import { useState, useEffect } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { Entry } from "@/components/Entry";
import { InventoryModel, ListWebsite } from "../types/types";
import { Flex, HStack, SimpleGrid, VStack } from "@chakra-ui/react";
import { useDroppable } from "@dnd-kit/core";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";
import { ListLookup } from "@/components/ListLookup";

interface InventoryProps {
  inventory: InventoryModel;
  setInventoryCallback: (site: ListWebsite, username: string) => Promise<void>;
}

export const Inventory = ({
  inventory,
  setInventoryCallback,
}: InventoryProps) => {
  const columnCount = 10;
  const rowsPerPage = 5;
  const pageSize = columnCount * rowsPerPage;

  const [page, setPage] = useState(1);

  const startRange = (page - 1) * pageSize;
  const endRange = startRange + pageSize;

  const visibleEntries = inventory.entries.slice(startRange, endRange);

  // Get the current page slice
  const { setNodeRef } = useDroppable({
    id: "inventory",
    data: { containerId: "inventory" },
  });

  // consider resetting page to 1 if a new inventory is loaded,
  // maybe move all the inventory fetching stuff in here so it's easier to work with
  useEffect(() => {
    setPage(
      Math.min(
        page,
        Math.max(1, Math.ceil(inventory.entries.length / pageSize))
      )
    );
  }, [inventory, page, pageSize]);
  return (
    <VStack>
      <ListLookup setInventoryCallback={setInventoryCallback} />
      <SortableContext items={inventory.entries}>
        <Flex direction="column" align="center">
          <SimpleGrid columns={columnCount} ref={setNodeRef} minHeight={"50vh"}>
            {visibleEntries.map((entry) => (
              <Entry key={entry.id} entry={entry} containerId={"inventory"} />
            ))}
          </SimpleGrid>
          {inventory.entries.length > 0 && (
            <PaginationRoot
              count={inventory.entries.length}
              pageSize={pageSize}
              onPageChange={(e) => {
                setPage(e.page);
              }}
            >
              <HStack>
                <PaginationPrevTrigger />
                <PaginationItems />
                <PaginationNextTrigger />
              </HStack>
            </PaginationRoot>
          )}
        </Flex>
      </SortableContext>
    </VStack>
  );
};
