import { Flex, Center, Heading } from "@chakra-ui/react";
import { SortableContext } from "@dnd-kit/sortable";
import { Entry } from "@/components/Entry";
import { TierModel } from "@/types/types";
import { useDroppable } from "@dnd-kit/core";

interface TierProps {
  tierModel: TierModel;
  index: number;
}

export const Tier = ({ tierModel, index }: TierProps) => {
  const { setNodeRef } = useDroppable({
    id: index,
    data: { containerId: index },
  });
  return (
    <Flex borderWidth="0px" key={tierModel.name}>
      <Center borderWidth="2px" minW="100px" minH="210px">
        <Heading>{tierModel.name}</Heading>
      </Center>
      <SortableContext items={tierModel.entries}>
        <Flex borderWidth="2px" flexWrap="wrap" flexGrow={1} ref={setNodeRef}>
          {tierModel.entries &&
            tierModel.entries.map((entry) => (
              <Entry key={entry.id} entry={entry} containerId={index} />
            ))}
        </Flex>
      </SortableContext>
    </Flex>
  );
};
