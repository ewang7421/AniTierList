import { useState } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { Entry } from "@/Entry";
import { InventoryModel } from "./types";
import { Button, Flex, SimpleGrid } from "@chakra-ui/react";
import { useDroppable } from "@dnd-kit/core";

interface InventoryProps {
  inventory: InventoryModel;
}

export const Inventory = ({ inventory }: InventoryProps) => {
  const columnCount = 10; // Number of columns
  const rowsPerPage = 5; // Number of rows visible at a time
  const itemsPerPage = columnCount * rowsPerPage; // Total visible items per page
  const pageCount = Math.ceil(inventory.entries.length / itemsPerPage);

  const [page, setPage] = useState(0); // Current page index

  // Get the current page slice
  const visibleEntries = inventory.entries.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const { setNodeRef } = useDroppable({
    id: "inventory",
    data: { containerId: "inventory" },
  });
  return (
    <SortableContext items={inventory.entries}>
      <Flex direction="column" align="center">
        {/* Inventory Grid */}
        <SimpleGrid columns={columnCount} ref={setNodeRef}>
          {visibleEntries.map((entry) => (
            <Entry key={entry.id} entry={entry} containerId={"inventory"} />
          ))}
        </SimpleGrid>

        {/* Navigation Buttons */}
        <Flex mt={2} gap={2}>
          <Button
            variant="subtle"
            onClick={() => setPage((prev) => prev - 1)}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="subtle"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= pageCount - 1}
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </SortableContext>
  );
};
