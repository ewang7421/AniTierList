import { Flex, Box, Button, HStack, Center, Spinner } from "@chakra-ui/react";
import { SortableContext } from "@dnd-kit/sortable";
import { Tier } from "@/components/Tier";
import { SaveToWebsiteModal } from "@/components/SaveToWebsiteModal";
import { ClearButton } from "./ClearButton";
import { SizeSlider } from "./SizeSlider";
import { useTierListModel } from "@/context/TierListModelContext";
export const Tierlist = () => {
  const { isLoading, tierListModel } = useTierListModel();

  return (
    <Flex w="100%" flexDirection="column">
      <SizeSlider />
      <Box position="relative">
        {tierListModel.tiers &&
          tierListModel.tiers.map((model, index) => (
            <SortableContext key={index} items={model.entries}>
              <Tier tierModel={model} index={index} />
            </SortableContext>
          ))}
        {isLoading && (
          <Box pos="absolute" inset="0" bg="bg/80">
            <Center h="full">
              <Spinner color="teal.500" />
            </Center>
          </Box>
        )}
      </Box>
      <HStack alignSelf={"center"}>
        <ClearButton />
        <SaveToWebsiteModal />
        <Button variant="subtle">Download</Button>
      </HStack>
    </Flex>
  );
};
