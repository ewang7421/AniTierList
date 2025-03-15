import { Text, Flex, Button, HStack } from "@chakra-ui/react";
import { TierModel } from "../types/types";
import { SortableContext } from "@dnd-kit/sortable";
import { Tier } from "@/components/Tier";
import { SaveToWebsiteModal } from "@/components/SaveToWebsiteModal";

interface TierlistProps {
  tierModels: TierModel[];
}

export const Tierlist = ({ tierModels }: TierlistProps) => {
  return (
    <Flex w="100%" flexDirection="column">
      <Text>Tierlist</Text>
      {tierModels &&
        tierModels.map((model, index) => (
          <SortableContext key={model.name} items={model.entries}>
            <Tier tierModel={model} index={index} />
          </SortableContext>
        ))}
      <HStack alignSelf={"center"}>
        <SaveToWebsiteModal />
        <Button variant="subtle">Download</Button>
      </HStack>
    </Flex>
  );
};
