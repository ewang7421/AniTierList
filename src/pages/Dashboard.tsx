import { VStack, Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { TierListEntry } from "@/types/types";
import { Tierlist } from "@/components/Tierlist";
import { Inventory } from "@/components/Inventory";
import { arrayMove } from "@dnd-kit/sortable";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { EntryPreview } from "@/components/EntryPreview.tsx";
import { createPortal } from "react-dom";
import { useLoadedUser } from "@/context/LoadedUserContext";
import { PointerRectCollisionDetectionAlgorithm } from "@/dnd/PointerRectCollisionDetectionAlgorithm";

// when getting from localstorage, put a last updated and a force update on lists (maybe even rate limit the force update)
export const Dashboard = () => {
  const { loadedUser, tierListModel, setTierListModel } = useLoadedUser();
  const [activeEntry, setActiveEntry] = useState<TierListEntry | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    console.log("dragStart: ", event);
    console.log("dragging id: ", event.active.id);

    const entry = event.active.data.current?.entry;
    if (!entry) {
      return;
    }
    setActiveEntry(entry);
  };

  // TODO: fill out rest of logic for dropping.
  const handleDragEnd = (event: DragEndEvent) => {
    console.log("dragEnd: ", event);
    console.log("dropped item: ", event.active);
    console.log("dropped over: ", event.over);
    const { active, over } = event;
    if (active == null || over == null) {
      return;
    }
    if (!active.data.current || !over.data.current) {
      return;
    }

    // dragging within same tier
    if (active.data.current.containerId == over.data.current.containerId) {
      if (active.data.current.containerId == "inventory") {
        setTierListModel((prev) => ({
          ...prev,
          inventory: {
            entries: arrayMove(
              prev.inventory.entries,
              active.data.current?.sortable.index,
              over.data.current?.sortable
                ? over.data.current?.sortable.index
                : prev.inventory.entries.length - 1
            ),
          },
        }));
      } else {
        setTierListModel((prev) => ({
          ...prev,

          tiers: prev.tiers.map((tier, index) =>
            index == over.data.current?.containerId
              ? {
                  ...tier,
                  entries: arrayMove(
                    tier.entries,
                    active.data.current?.sortable.index,
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
          index == active.data.current?.containerId
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
          index == over.data.current?.containerId
            ? {
                ...tier,
                entries: over.data.current.sortable
                  ? [
                      ...tier.entries.slice(
                        0,
                        over.data.current.sortable.index
                      ),
                      active.data.current?.entry,
                      ...tier.entries.slice(over.data.current.sortable.index),
                    ]
                  : [...tier.entries, active.data.current?.entry],
              }
            : tier
        );
      }

      setTierListModel((prev) => ({
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
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={PointerRectCollisionDetectionAlgorithm}
    >
      <Box>
        <VStack>
          <Tierlist />
          <Inventory />
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
