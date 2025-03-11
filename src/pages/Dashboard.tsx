import { VStack, Box } from "@chakra-ui/react";
import { getList } from "@/api/api";
import { useState, useEffect } from "react";
import {
  ListWebsite,
  TierListEntry,
  TierListModel,
  TierModel,
  User,
} from "@/types/types";
import { Tierlist } from "@/components/Tierlist";
import { Inventory } from "@/components/Inventory";
import { arrayMove } from "@dnd-kit/sortable";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { EntryPreview } from "@/components/EntryPreview.tsx";
import { createPortal } from "react-dom";

const cachedLoadedUser: User | null = JSON.parse(
  window.localStorage.getItem("AniTierList:Dashboard:loadedUser") || "null"
) as User | null;

const cachedTierListModel: TierListModel | null = JSON.parse(
  window.localStorage.getItem("AniTierList:Dashboard:TierListModel") || "null"
) as TierListModel | null;

// when getting from localstorage, put a last updated and a force update on lists (maybe even rate limit the force update)
export const Dashboard = () => {
  const [loadedUser, setLoadedUser] = useState<User | null>(cachedLoadedUser);
  const [tierListModel, setTierlistModel] = useState<TierListModel>(
    cachedTierListModel || {
      inventory: { entries: [] },
      tiers: [
        // the inventory is at index 0
        { entries: [], name: "A", minScore: 8, maxScore: 9 },
        { entries: [], name: "B", minScore: 6, maxScore: 7 },
        { entries: [], name: "C", minScore: 4, maxScore: 5 },
        { entries: [], name: "D", minScore: 2, maxScore: 3 },
        { entries: [], name: "F", minScore: 0, maxScore: 1 },
      ],
    }
  );
  const [activeEntry, setActiveEntry] = useState<TierListEntry | null>(null);

  // TODO: have some warning telling user that we will reset the state of the tierlist
  const fetchUserList = async (site: ListWebsite, username: string) => {
    if (username.trim().length < 2) {
      throw Error("Username must be at least 2 characters");
    }
    if (tierListModel.tiers.some((tierModel) => tierModel.entries.length > 0)) {
      console.log("send warning that tiers will be reset");
    }
    try {
      const { completedList, user } = await getList(site, username); // Set the state with the fetched data
      // Set the tier list model's inventory to the fetched anime list

      if (completedList) {
        setTierlistModel((prev) => ({
          ...prev,
          tiers: prev.tiers.map((prevTier: TierModel) => ({
            ...prevTier,
            entries: [],
          })),
          inventory: {
            ...prev.inventory,
            entries: completedList,
          },
        }));
      }

      if (user) {
        setLoadedUser(user);
      }
    } catch (error) {
      //TODO: this console error is only to prevent eslint error
      console.error(error);
      throw error;
    }
  };

  const syncTierList = (newEntries: TierListEntry[]): TierListModel => {
    // Step 1: Convert cached list to a Map for O(1) lookups
    const currentEntries = [
      ...tierListModel.inventory.entries.map((entry) => ({
        entry: entry,
        index: "inventory",
      })),
      ...tierListModel.tiers.map((tier, index) =>
        tier.entries.map((entry) => ({
          entry: entry,
          index: index,
        }))
      ),
    ].flat();
    const cachedMap = new Map(
      currentEntries.map((flattenedEntry) => [
        flattenedEntry.entry.id,
        { entry: flattenedEntry.entry, index: flattenedEntry.index },
      ])
    );

    // Step 2: Track new and existing items
    const updatedMap = new Map(newEntries.map((entry) => [entry.id, entry]));

    // Step 3: Add new items from updatedList
    for (const [id, newEntry] of updatedMap) {
      cachedMap.set(id, { entry: newEntry, index: "inventory" }); // Adds if not present
    }

    // Step 4: Remove items that are no longer in updatedList
    for (const id of cachedMap.keys()) {
      if (!updatedMap.has(id)) {
        cachedMap.delete(id);
      }
    }

    // Step 5: Convert Map back to an array for sorting
    const newInventory = Array.from(cachedMap.values())
      .filter((entryData) => entryData.index === "inventory")
      .map((entryData) => entryData.entry);
    const newTiers = tierListModel.tiers.map((tier, index) => {
      const tierEntries = Array.from(cachedMap.values())
        .filter((entryData) => entryData.index === index)
        .map((entryData) => entryData.entry);
      return {
        ...tier,
        entries: tierEntries,
      };
    });

    // Return the sorted list to render
    return {
      ...tierListModel,
      inventory: { entries: newInventory },
      tiers: newTiers,
    };
  };

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
            ...newInventory.entries.slice(
              0,
              active.data.current.sortable.index
            ),
            ...newInventory.entries.slice(
              active.data.current.sortable.index + 1
            ),
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
                ...newInventory.entries.slice(
                  0,
                  over.data.current.sortable.index
                ),
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
                      ...tier.entries.slice(
                        0,
                        over.data.current.sortable.index
                      ),
                      active.data.current.entry,
                      ...tier.entries.slice(over.data.current.sortable.index),
                    ]
                  : [...tier.entries, active.data.current.entry],
              }
            : tier
        );
      }

      setTierlistModel((prev) => ({
        ...prev,
        inventory: newInventory,
        tiers: newTiers,
      }));
      console.log(tierListModel);
    }

    setActiveEntry(null);
  };

  useEffect(() => {
    window.localStorage.setItem(
      "AniTierList:Dashboard:TierListModel",
      JSON.stringify(tierListModel)
    );
  }, [tierListModel]);
  useEffect(() => {
    window.localStorage.setItem(
      "AniTierList:Dashboard:loadedUser",
      JSON.stringify(loadedUser)
    );
  }, [loadedUser]);
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box>
        <VStack>
          <Tierlist tierModels={tierListModel.tiers} />
          <Inventory
            inventory={tierListModel.inventory}
            user={loadedUser}
            fetchListWrapper={fetchUserList}
          />
        </VStack>
      </Box>

      {createPortal(
        <DragOverlay>
          {activeEntry && <EntryPreview entry={activeEntry} containerId={-1} />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
