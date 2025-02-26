import {
  VStack,
  Box,
  createListCollection,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  HStack,
  Input,
  Button,
} from "@chakra-ui/react";
import { getList } from "@/anilist.tsx";
import { useState } from "react";
import { ListWebsite, TierListEntry, TierListModel } from "@/types.ts";
import { Tierlist } from "@/Tierlist.tsx";
import { Inventory } from "@/Inventory.tsx";
import { SortableContext } from "@dnd-kit/sortable";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { EntryPreview } from "@/EntryPreview.tsx";
import { createPortal } from "react-dom";
import { Entry } from "./Entry";

export const Dashboard = () => {
  const [username, setUsername] = useState("watermeloans");
  const [listWebsite, setListWebsite] = useState<string[]>([]);
  const [tierListModel, setTierlistModel] = useState<TierListModel>({
    inventory: { entries: [] },
    tiers: [
      // the inventory is at index 0
      { entries: [], name: "A", minScore: 8, maxScore: 9 },
      { entries: [], name: "B", minScore: 6, maxScore: 7 },
      { entries: [], name: "C", minScore: 4, maxScore: 5 },
      { entries: [], name: "D", minScore: 2, maxScore: 3 },
      { entries: [], name: "F", minScore: 0, maxScore: 1 },
    ],
  });
  const [activeEntry, setActiveEntry] = useState<TierListEntry | null>(null);

  const handleDragStart = (event) => {
    console.log(event);
    setActiveEntry(event.active.data.current);
  };

  const handleDragEnd = () => {
    setActiveEntry(null);
  };
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box>
        <VStack>
          <Tierlist
            tierModels={tierListModel.tiers}
            handleDragStart={() => {}}
            handleDragOver={() => {}}
            handleDrop={() => {}}
          />
          <HStack align="flex-start" minHeight="150px">
            <SelectRoot
              variant="subtle"
              collection={listWebsites}
              value={[listWebsite?.toString()]}
              onValueChange={(e) => setListWebsite(e.value)}
            >
              <SelectLabel>Choose Website</SelectLabel>
              <SelectTrigger>
                <SelectValueText placeholder="Select Website" />
              </SelectTrigger>
              <SelectContent>
                {listWebsites.items.map((website) => (
                  <SelectItem item={website} key={website.value}>
                    {website.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>

            <Input
              mt="25px"
              placeholder="username"
              variant="subtle"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchListToInventory(
                    username,
                    tierListModel,
                    setTierlistModel
                  );
                }
              }}
            ></Input>

            <Button
              mt="25px"
              variant="subtle"
              onClick={() =>
                fetchListToInventory(username, tierListModel, setTierlistModel)
              }
            >
              get
            </Button>
          </HStack>
          <Inventory inventory={tierListModel.inventory} />
        </VStack>
      </Box>

      {createPortal(
        <DragOverlay>
          {activeEntry && <EntryPreview entry={activeEntry} />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
const listWebsites = createListCollection({
  items: [
    { label: "Anilist", value: ListWebsite.AniList.toString() },
    { label: "MyAnimeList", value: ListWebsite.MyAnimeList.toString() },
  ],
});
const fetchListToInventory = async (
  username: string,
  tierListModel: TierListModel,
  setTierlistModelCallback: (tierListModel: TierListModel) => void
) => {
  try {
    const entries = await getList(username); // Set the state with the fetched data
    // Set the tier list model's inventory to the fetched anime list
    const newInventory = {
      ...tierListModel.inventory,
      entries: entries,
    };
    setTierlistModelCallback({ ...tierListModel, inventory: newInventory });
  } catch (error) {
    console.error("Error fetching anime list:", error);
  }
};
