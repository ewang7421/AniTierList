import { Box } from "@chakra-ui/react";
import { TierListEntry } from "@/types/types";

interface EntryProps {
  entry: TierListEntry;
  containerId: "inventory" | number;
}

export const EntryPreview = ({ entry }: EntryProps) => {
  return (
    <Box
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
