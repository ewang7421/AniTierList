import { getList } from "@/api/api";
import { ListWebsite, TierListEntry, TierListModel, User } from "@/types/types";
import { createListCollection } from "@chakra-ui/react";

//TODO: maybe doesn't belong here.
export const listWebsites = createListCollection({
  items: [
    { label: "AniList", value: ListWebsite.AniList.toString() },
    { label: "MyAnimeList", value: ListWebsite.MyAnimeList.toString() },
  ],
});
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
export const syncEntries = async (
  user: User,
  oldEntries: { tier: number | null; entry: TierListEntry }[]
): Promise<{ tier: number | null; entry: TierListEntry }[]> => {
  try {
    const updated = await getList(user.site, user.name);
    const oldMap: Map<number, { tier: number | null; entry: TierListEntry }> =
      new Map(oldEntries.map((oldEntry) => [oldEntry.entry.id, oldEntry]));
    const newMap: Map<number, { tier: number | null; entry: TierListEntry }> =
      new Map(
        updated.completedList.map((newEntry) => [
          newEntry.id,
          { tier: null, entry: newEntry },
        ])
      );

    for (const [id, newEntry] of newMap) {
      const oldEntry = oldMap.get(id);
      if (oldEntry != null) {
        newMap.set(id, { ...newEntry, tier: oldEntry.tier });
      }
    }
    return Array.from(newMap.values()).sort((a, b) =>
      a.entry.title.localeCompare(b.entry.title)
    );
  } catch (error) {
    console.error("Error during sync", error);
    return oldEntries;
  }
};
