import { Text, Flex } from "@chakra-ui/react";
import { TierModel } from "./types";
import { SortableContext } from "@dnd-kit/sortable";
import { Tier } from "@/Tier";

interface TierlistProps {
  tierModels: TierModel[];
}

export const Tierlist = ({ tierModels }: TierlistProps) => {
  return (
    <Flex w="100%" flexDirection="column">
      <Text>Tierlist</Text>
      {tierModels &&
        tierModels.map((model, index) => (
          <SortableContext items={model.entries}>
            <Tier tierModel={model} index={index} />
          </SortableContext>
        ))}
    </Flex>
  );
};
