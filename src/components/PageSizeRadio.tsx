import { pageSizeOptions } from "@/config/sizes";
import { useSettings } from "@/context/SettingsContext";
import { Flex, Text } from "@chakra-ui/react";

/*
Inspired by Steam's Workshop UI
*/
export const PageSizeRadio = () => {
  const { settings, setSettings } = useSettings();
  return (
    <Flex align="center" gap={1}>
      <Text fontWeight={"medium"}>Per page:</Text>
      {pageSizeOptions.map((pageSize, index) => {
        const selected = pageSize === settings.inventoryPageSize;
        return (
          <Text
            onClick={() =>
              setSettings((prev) => ({ ...prev, inventoryPageSize: pageSize }))
            }
            onMouseDown={(e) => {
              if (e.detail > 1) {
                e.preventDefault(); // prevent double-click from selecting text
              }
            }}
            fontWeight="medium"
            color={selected ? "gray.500" : ""}
            _hover={!selected ? { color: "blue.400" } : undefined}
            key={index}
            cursor={selected ? "default" : "pointer"}
          >
            {pageSize.toString()}
          </Text>
        );
      })}
    </Flex>
  );
};
