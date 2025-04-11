import { Box } from "@chakra-ui/react";
import { DroppableType, TierListEntry } from "@/types/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSettings } from "@/context/SettingsContext";

interface EntryProps {
  entry: TierListEntry;
  containerId: "inventory" | number;
}

export const Entry = ({ entry, containerId = -1 }: EntryProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: entry.id,
      data: {
        entry: entry,
        droppableType: DroppableType.ENTRY,
        containerId: containerId,
      },
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { settings } = useSettings();
  return (
    <Box
      id={entry.id.toString()}
      w={settings.entrySize.w.toString() + "px"}
      h={settings.entrySize.h.toString() + "px"}
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
