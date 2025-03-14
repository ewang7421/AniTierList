import { TierListEntry, User } from "@/types/types";
import { Field, Button } from "@chakra-ui/react";
import { getList } from "@/api/api";

interface RefreshButtonProps {
  user: User;
  oldEntries: TierListEntry[];
  syncListCallback: (entries: TierListEntry[]) => void;
  lastUpdatedKey: string;
}

const dateToLastUpdatedText = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 0) {
    return "N/A";
  }
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  } else if (diffInDays < 365) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  } else {
    return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
  }
};
export const RefreshButton = ({
  user,
  oldEntries,
  syncListCallback,
  lastUpdatedKey,
}: RefreshButtonProps) => {
  const syncEntries = async (): Promise<TierListEntry[]> => {
    if (!user) {
      return oldEntries;
    }
    try {
      const updated = await getList(user.site, user.name);
      // Step 1: Convert cached list to a Map for O(1) lookups
      const cachedMap = new Map(
        oldEntries.map((oldEntry) => [oldEntry.id, oldEntry])
      );

      // Step 2: Track new and existing items
      const updatedMap = new Map(
        updated.completedList.map((entry) => [entry.id, entry])
      );

      // Step 3: Add new items from updatedList
      for (const [id, newEntry] of updatedMap) {
        if (!cachedMap.has(id)) {
          cachedMap.set(id, newEntry); // Adds if not present
        }
      }

      // Step 4: Remove items that are no longer in updatedList
      for (const id of cachedMap.keys()) {
        if (!updatedMap.has(id)) {
          cachedMap.delete(id);
        }
      }

      // Step 5: Convert Map back to an array for sorting
      return Array.from(cachedMap.values());
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const lastUpdatedStr: string | null = localStorage.getItem(lastUpdatedKey);
  return (
    <Field.Root>
      <Button
        variant="subtle"
        onClick={async () => {
          syncListCallback(await syncEntries());
          localStorage.setItem(lastUpdatedKey, new Date().toISOString());
        }}
      >
        RefreshTEST
      </Button>
      <Field.HelperText>{`Last Updated: ${
        lastUpdatedStr ? dateToLastUpdatedText(new Date(lastUpdatedStr)) : "N/A"
      }`}</Field.HelperText>
    </Field.Root>
  );
};
