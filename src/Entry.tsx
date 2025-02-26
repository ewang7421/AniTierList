import { Box } from "@chakra-ui/react";
import {
  DraggableType,
  DroppableType,
  ContainerType,
  TierListEntry,
} from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface EntryProps {
  entry: TierListEntry;
  containerType: ContainerType;
  containerId: string | null;
}

export const Entry = ({ entry, containerType, containerId }: EntryProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: entry.id,
      data: {
        entry: entry,
        draggableType: DraggableType.ENTRY,
        droppableType: DroppableType.ENTRY,
        containerType: containerType,
        containerId: containerId,
      },
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <Box
      id={entry.id.toString()}
      w="150px"
      h="210px"
      bgImage={`url(${entry.imageUrl})`}
      bgSize="cover"
      bgRepeat="no-repeat"
      bgPos="center"
      borderRadius={3}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    ></Box>
  );
};
