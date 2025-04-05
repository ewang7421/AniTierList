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
  Grid,
} from "@chakra-ui/react";
import { useDroppable } from "@dnd-kit/core";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";
import { ListLookup } from "@/components/ListLookup";
import { useTierListModel } from "@/context/TierListModelContext";
import { useSettings } from "@/context/SettingsContext";
export const Inventory = () => {
  const { tierListModel, isLoading } = useTierListModel();
  const { settings } = useSettings();
  const columnCount = 10;
  const rowCount = 5;
  const pageSize = columnCount * rowCount;

  const minHeight = settings.entrySize.h * rowCount;

  const [page, setPage] = useState(1);

  const startRange = (page - 1) * pageSize;
  const endRange = startRange + pageSize;

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
          Math.ceil(tierListModel.inventory.entries.length / pageSize)
        )
      )
    );
  }, [tierListModel.inventory, page, pageSize]);
  return (
    <VStack>
      <ListLookup />
      <Box position="relative">
        <SortableContext items={tierListModel.inventory.entries}>
          <Flex direction="column" align="center">
            <Grid
              templateColumns={`repeat(${columnCount}, 1fr)`}
              ref={setNodeRef}
              minHeight={minHeight.toString() + "px"}
              alignContent={"start"}
            >
              {visibleEntries.map((entry) => (
                <Entry key={entry.id} entry={entry} containerId={"inventory"} />
              ))}
            </Grid>
            {tierListModel.inventory.entries.length > 0 && (
              <PaginationRoot
                count={tierListModel.inventory.entries.length}
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
