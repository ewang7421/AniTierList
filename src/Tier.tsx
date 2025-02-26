import { Flex, Center } from "@chakra-ui/react";
import { TierListEntry } from "./types";
import { useSortable, SortableContext } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Entry } from "./Entry";
import { TierModel } from "@/types";

interface TierProps {
  tierModel: TierModel;
}

export const Tier = ({ tierModel }: TierProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: tierModel.name });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <Flex border="1px" key={tierModel.name}>
      <Center border="1px" minW="100px" minH="210px">
        {tierModel.name}
      </Center>
      <SortableContext items={tierModel.entries}>
        <Flex
          border="1px"
          flexWrap="wrap"
          flexGrow={1}
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          style={style}
        >
          {tierModel.entries &&
            tierModel.entries.map((entry) => (
              <Entry key={entry.id} entry={entry} />
            ))}
        </Flex>
      </SortableContext>
    </Flex>
  );
};
