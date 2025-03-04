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
import { arrayMove } from "@dnd-kit/sortable";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { EntryPreview } from "@/EntryPreview.tsx";
import { createPortal } from "react-dom";

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
    console.log("dragStart: ", event);
    console.log("dragging id: ", event.active.id);
    setActiveEntry(event.active.data.current.entry);
  };

  // TODO: fill out rest of logic for dropping.
  const handleDragEnd = (event) => {
    console.log("dragEnd: ", event);
    console.log("dropped item: ", event.active);
    console.log("dropped over: ", event.over);
    const { active, over } = event;
    if (active == null || over == null) {
      return;
    }

    // dragging within same tier
    if (active.data.current.containerId == over.data.current.containerId) {
      if (active.data.current.containerId == "inventory") {
        setTierlistModel((prev) => ({
          ...prev,
          inventory: {
            entries: arrayMove(
              prev.inventory.entries,
              active.data.current.sortable.index,
              over.data.current.sortable
                ? over.data.current.sortable.index
                : prev.inventory.entries.length - 1
            ),
          },
        }));
      } else {
        setTierlistModel((prev) => ({
          ...prev,

          tiers: prev.tiers.map((tier, index) =>
            index == over.data.current.containerId
              ? {
                  ...tier,
                  entries: arrayMove(
                    tier.entries,
                    active.data.current.sortable.index,
                    over.data.current.sortable
                      ? over.data.current.sortable.index
                      : tier.entries.length - 1
                  ),
                }
              : tier
          ),
        }));
      }
    } else {
      let newInventory = tierListModel.inventory;
      let newTiers = tierListModel.tiers;

      if (active.data.current.containerId == "inventory") {
        newInventory = {
          ...newInventory,
          entries: [
            ...newInventory.entries.slice(0, active.data.current.sortable.index),
            ...newInventory.entries.slice(active.data.current.sortable.index + 1),
          ],
        };
      } else {
        newTiers = newTiers.map((tier, index) =>
          index == active.data.current.containerId
            ? {
                ...tier,
                entries: [
                  ...tier.entries.slice(0, active.data.current.sortable.index),
                  ...tier.entries.slice(active.data.current.sortable.index + 1),
                ],
              }
            : tier
        );
      }

      if (over.data.current.containerId == "inventory") {
        newInventory = {
          ...newInventory,
          entries: over.data.current.sortable
            ? [
                ...newInventory.entries.slice(0, over.data.current.sortable.index),
                active.data.current.entry,
                ...newInventory.entries.slice(over.data.current.sortable.index),
              ]
            : [...newInventory.entries, active.data.current.entry],
        };
      } else {
        console.log(over.data.current.containerId);
        newTiers = newTiers.map((tier, index) =>
          index == over.data.current.containerId
            ? {
                ...tier,
                entries: over.data.current.sortable
                  ? [
                      ...tier.entries.slice(0, over.data.current.sortable.index),
                      active.data.current.entry,
                      ...tier.entries.slice(over.data.current.sortable.index),
                    ]
                  : [...tier.entries, active.data.current.entry],
              }
            : tier
        );
      }

      setTierlistModel((prev) => ({ ...prev, inventory: newInventory, tiers: newTiers }));
      console.log(tierListModel);
    }

    setActiveEntry(null);
  };
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box>
        <VStack>
          <Tierlist tierModels={tierListModel.tiers} />
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
                  fetchListToInventory(username, tierListModel, setTierlistModel);
                }
              }}
            ></Input>

            <Button
              mt="25px"
              variant="subtle"
              onClick={() => fetchListToInventory(username, tierListModel, setTierlistModel)}
            >
              get
            </Button>
          </HStack>
          <Inventory inventory={tierListModel.inventory} />
        </VStack>
      </Box>

      {createPortal(
        <DragOverlay>{activeEntry && <EntryPreview entry={activeEntry} />}</DragOverlay>,
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
