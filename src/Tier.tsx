import { Flex, Center } from "@chakra-ui/react";
import { SortableContext } from "@dnd-kit/sortable";
import { Entry } from "./Entry";
import { TierModel } from "@/types";
import { useDroppable } from "@dnd-kit/core";

interface TierProps {
  tierModel: TierModel;
  index: number;
}

export const Tier = ({ tierModel, index }: TierProps) => {
  const { setNodeRef } = useDroppable({
    id: index,
    data: {containerId: index}
  });
  return (
    <Flex border="1px" key={tierModel.name}>
      <Center border="1px" minW="100px" minH="210px">
        {tierModel.name}
      </Center>
      <SortableContext items={tierModel.entries}>
        <Flex border="1px" flexWrap="wrap" flexGrow={1} ref={setNodeRef}>
          {tierModel.entries &&
            tierModel.entries.map((entry) => (
              <Entry key={entry.id} entry={entry} containerId={index} />
            ))}
        </Flex>
      </SortableContext>
    </Flex>
  );
};
