import { useState, useEffect } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { Entry } from "@/components/Entry";
import {
  Flex,
  HStack,
  VStack,
  Box,
  Spinner,
  Center,
  SimpleGrid,
} from "@chakra-ui/react";
import { useDroppable } from "@dnd-kit/core";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";
import { InventoryHeader } from "@/components/InventoryHeader";
import { useTierListModel } from "@/context/TierListModelContext";
import { useSettings } from "@/context/SettingsContext";
export const Inventory = () => {
  const { tierListModel, isLoading } = useTierListModel();
  const { settings } = useSettings();

  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState<number>(1);

  // Can hard code factors for each page size, but this might be better\
  // find factors in descending order to make breakpoints for pagesize
  const findFactors = (n: number): number[] => {
    const factors = new Set<number>();
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        factors.add(i);
        factors.add(n / i);
      }
    }

    return Array.from(factors).sort((a, b) => b - a);
  };
  useEffect(() => {
    const updateColumns = () => {
      const componentWidth = window.innerWidth * 0.9;
      const maxColumns = Math.floor(componentWidth / settings.entrySize.w);
      const validFactors = findFactors(settings.inventoryPageSize).filter(
        (f) => f <= maxColumns
      );
      const bestFit = validFactors.length ? Math.max(...validFactors) : 1;
      setColumns(bestFit);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [settings.entrySize, settings.inventoryPageSize]);

  const startRange = (page - 1) * settings.inventoryPageSize;
  const endRange = startRange + settings.inventoryPageSize;

  const visibleEntries = tierListModel.inventory.entries.slice(
    startRange,
    endRange
  );

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
        Math.max(
          1,
          Math.ceil(
            tierListModel.inventory.entries.length / settings.inventoryPageSize
          )
        )
      )
    );
  }, [tierListModel.inventory, page, settings.inventoryPageSize]);
  return (
    <VStack maxWidth={"85vw"}>
      <InventoryHeader />
      <Box position="relative">
        <SortableContext items={tierListModel.inventory.entries}>
          <Flex direction="column" align="center">
            <SimpleGrid ref={setNodeRef} columns={columns}>
              {visibleEntries.map((entry) => (
                <Entry key={entry.id} entry={entry} containerId={"inventory"} />
              ))}
            </SimpleGrid>
            {tierListModel.inventory.entries.length > 0 && (
              <PaginationRoot
                count={tierListModel.inventory.entries.length}
                pageSize={settings.inventoryPageSize}
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
        {isLoading && (
          <Box pos="absolute" inset="0" bg="bg/80">
            <Center h="full">
              <Spinner color="teal.500" />
            </Center>
          </Box>
        )}
      </Box>
    </VStack>
  );
};
