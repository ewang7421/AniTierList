import { ListWebsite, TierListEntry, TierListModel } from "@/types/types";
import { createListCollection } from "@chakra-ui/react";

export const clearTierListModel = (tierListModel: TierListModel) => {
  const newTiers = tierListModel.tiers.map((tier) => ({
    ...tier,
    entries: [],
  }));

  const newInventory = {
    ...tierListModel.inventory,
    entries: [
      ...tierListModel.inventory.entries,
      ...tierListModel.tiers.map((tier) => tier.entries).flat(),
    ].sort((a, b) => a.title.localeCompare(b.title)),
  };

  return { ...tierListModel, inventory: newInventory, tiers: newTiers };
};

export const flattenTierListEntries = (
  tierListModel: TierListModel
): { tier: number | null; entry: TierListEntry }[] => {
  return [
    ...tierListModel.inventory.entries.map((entry) => ({
      tier: null,
      entry: entry,
    })),
    ...tierListModel.tiers.flatMap((tier, index) =>
      tier.entries.map((entry) => ({ tier: index, entry: entry }))
    ),
  ];
};

export const loadFlatEntries = (
  prevTierListModel: TierListModel,
  flatEntries: { tier: number | null; entry: TierListEntry }[]
) => {
  const newInventory = {
    entries: flatEntries
      .filter((entryData) => entryData.tier == null)
      .map((entryData) => entryData.entry),
  };

  const newTiers = prevTierListModel.tiers.map((prevTier, index) => ({
    ...prevTier,
    entries: prevTier.entries.filter((prevEntry) => {
      const newEntryData = flatEntries.find(
        (newEntryData) => newEntryData.entry.id === prevEntry.id
      );

      return newEntryData != null && newEntryData.tier === index;
    }),
  }));

  return { ...prevTierListModel, tiers: newTiers, inventory: newInventory };
};

//TODO: maybe doesn't belong here.
export const listWebsites = createListCollection({
  items: [
    { label: "AniList", value: ListWebsite.AniList.toString() },
    { label: "MyAnimeList", value: ListWebsite.MyAnimeList.toString() },
  ],
});
