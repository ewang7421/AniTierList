import { Box } from "@chakra-ui/react";
import { TierListEntry } from "@/types/types";
import { useLoadedUser } from "@/context/LoadedUserContext";

interface EntryProps {
  entry: TierListEntry;
  containerId: "inventory" | number;
}

export const EntryPreview = ({ entry }: EntryProps) => {
  const { entrySize } = useLoadedUser();
  return (
    <Box
      w={entrySize.w.toString() + "px"}
      h={entrySize.h.toString() + "px"}
      bgImage={`url(${entry.imageUrl})`}
      bgSize="cover"
      bgRepeat="no-repeat"
      bgPos="center"
      borderRadius={3}
    ></Box>
  );
};
