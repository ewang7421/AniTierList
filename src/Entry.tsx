import { Box } from "@chakra-ui/react";
import { TierListEntry } from "./types";

interface EntryProps {
  entry: TierListEntry;
}

export const Entry = ({ entry }: EntryProps) => {
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
    ></Box>
  );
};
