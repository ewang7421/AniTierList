import { useState, useEffect } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { Entry } from "@/components/Entry";
import { InventoryModel } from "../types/types";
import { Button, Flex, HStack, SimpleGrid } from "@chakra-ui/react";
import { useDroppable } from "@dnd-kit/core";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPageText,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";

interface InventoryProps {
  inventory: InventoryModel;
}

export const Inventory = ({ inventory }: InventoryProps) => {
  const columnCount = 10; // Number of columns
  const rowsPerPage = 5; // Number of rows visible at a time
  const pageSize = columnCount * rowsPerPage; // Total visible items per page

  const [page, setPage] = useState(1); // Current page index

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
    setPage(Math.min(page, Math.ceil(inventory.entries.length / pageSize)));
  }, [inventory]);
  return (
    <SortableContext items={inventory.entries}>
      <Flex direction="column" align="center">
        <SimpleGrid columns={columnCount} ref={setNodeRef} minHeight={"50vh"}>
          {visibleEntries.map((entry) => (
            <Entry key={entry.id} entry={entry} containerId={"inventory"} />
          ))}
        </SimpleGrid>
        <PaginationRoot
          count={inventory.entries.length}
          pageSize={pageSize}
          onPageChange={(e) => setPage(e.page)}
        >
          <HStack>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </HStack>
        </PaginationRoot>
      </Flex>
    </SortableContext>
  );
};
