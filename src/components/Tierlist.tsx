import {
  Text,
  Flex,
  Box,
  Button,
  HStack,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { TierModel } from "../types/types";
import { SortableContext } from "@dnd-kit/sortable";
import { Tier } from "@/components/Tier";
import { SaveToWebsiteModal } from "@/components/SaveToWebsiteModal";
import { useLoadedUser } from "@/context/LoadedUserContext";

interface TierlistProps {
  tierModels: TierModel[];
}

export const Tierlist = ({ tierModels }: TierlistProps) => {
  const { isLoading } = useLoadedUser();

  return (
    <Flex w="100%" flexDirection="column">
      <Text>Tierlist</Text>
      <Box position="relative">
        {tierModels &&
          tierModels.map((model, index) => (
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
        <SaveToWebsiteModal />
        <Button variant="subtle">Download</Button>
      </HStack>
    </Flex>
  );
};
