import { Box } from "@chakra-ui/react";
import { TierListEntry } from "./types";

interface EntryProps {
  entry: TierListEntry;
  tierIndex: number;
  entryIndex: number;
  handleDragStart: (entry: TierListEntry, tierIndex: number) => void;
  handleDragOver: (
    event: React.DragEvent<HTMLDivElement>,
    tierIndex: number,
    entryIndex: number
  ) => void;
}

export const Entry = ({
  entry,
  tierIndex,
  entryIndex,
  handleDragStart,
  handleDragOver,
}: EntryProps) => {
  return (
    <Box
      id={entry.id.toString()}
      draggable="true"
      onDragStart={() => {
        handleDragStart(entry, tierIndex);
      }}
      onDragOver={(e) => {
        handleDragOver(e, tierIndex, entryIndex);
      }}
      w="150px"
      h="210px"
      bgImage={`url(${entry.imageUrl})`}
      bgSize="cover"
      bgRepeat="no-repeat"
      bgPos="center"
      borderRadius={3}
    ></Box>
  );
};
