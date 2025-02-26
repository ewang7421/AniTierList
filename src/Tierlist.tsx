import { Text, Flex, Center } from "@chakra-ui/react";
import { TierListEntry, TierModel } from "./types";
import { Entry } from "./Entry";
import { SortableContext } from "@dnd-kit/sortable";

interface TierlistProps {
  tierModels: TierModel[];
  handleDragStart: (entry: TierListEntry, tierIndex: number) => void;
  handleDragOver: (
    event: React.DragEvent<HTMLDivElement>,
    tierIndex: number,
    entryIndex: number
  ) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

export const Tierlist = ({
  tierModels,
  handleDragStart,
  handleDragOver,
  handleDrop,
}: TierlistProps) => {
  return (
    <Flex w="100%" flexDirection="column">
      <Text>Tierlist</Text>
      {tierModels &&
        tierModels.map((model, tierIndex) => (
          <SortableContext items={model.entries}>
            <Flex border="1px" key={tierIndex + 1}>
              <Center border="1px" minW="100px" minH="210px">
                {model.name}
              </Center>
              <Flex
                border="1px"
                flexWrap="wrap"
                flexGrow={1}
                onDragOver={(e) => {
                  handleDragOver(e, tierIndex + 1, model.entries.length);
                }}
                onDrop={handleDrop}
              >
                {model.entries &&
                  model.entries.map((entry, entryIndex) => (
                    <Entry
                      key={entry.id}
                      entry={entry}
                      tierIndex={tierIndex + 1}
                      entryIndex={entryIndex}
                      handleDragStart={handleDragStart}
                      handleDragOver={handleDragOver}
                    />
                  ))}
              </Flex>
            </Flex>
          </SortableContext>
        ))}
    </Flex>
  );
};
