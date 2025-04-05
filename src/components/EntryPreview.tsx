import { Box } from "@chakra-ui/react";
import { TierListEntry } from "@/types/types";
import { useSettings } from "@/context/SettingsContext";

interface EntryProps {
  entry: TierListEntry;
  containerId: "inventory" | number;
}

export const EntryPreview = ({ entry }: EntryProps) => {
  const { settings } = useSettings();
  return (
    <Box
      w={settings.entrySize.w.toString() + "px"}
      h={settings.entrySize.h.toString() + "px"}
      bgImage={`url(${entry.imageUrl})`}
      bgSize="cover"
      bgRepeat="no-repeat"
      bgPos="center"
      borderRadius={3}
    ></Box>
  );
};
