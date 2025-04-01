import { TierListEntry, User } from "@/types/types";
import { Field, Button, Skeleton } from "@chakra-ui/react";
import { getList } from "@/api/api";
import { useEffect, useState } from "react";

interface RefreshButtonProps {
  user: User;
  oldEntries: { tier: number | null; entry: TierListEntry }[];
  setEntries: (
    entries: { tier: number | null; entry: TierListEntry }[]
  ) => void;
  lastUpdatedKey: string;
  setComponentLoading: React.Dispatch<React.SetStateAction<boolean>> | null;
}

const timeToHumanReadable = (time: number | null): string => {
  if (time == null) {
    return "N/A";
  }
  const diffInSeconds = Math.floor(time / 1000);
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
  setEntries,
  lastUpdatedKey,
  setComponentLoading,
}: RefreshButtonProps) => {
  const syncEntries = async (): Promise<
    { tier: number | null; entry: TierListEntry }[]
  > => {
    if (!user) {
      return oldEntries;
    }
    try {
      const updated = await getList(user.site, user.name);
      const oldMap = new Map(
        oldEntries.map((oldEntry) => [oldEntry.entry.id, oldEntry])
      );
      const newMap: Map<number, { tier: number | null; entry: TierListEntry }> =
        new Map(
          updated.completedList.map((newEntry) => [
            newEntry.id,
            { tier: null, entry: newEntry },
          ])
        );
      // keep the tier index
      for (const [id, newEntry] of newMap) {
        const oldEntry = oldMap.get(id);
        if (oldEntry != null) {
          newMap.set(id, { ...newEntry, tier: oldEntry.tier });
        }
      }

      //TODO: check which title you are actually comparing
      // Step 5: Convert Map back to an array for sorting
      return Array.from(newMap.values()).sort((a, b) =>
        a.entry.title.localeCompare(b.entry.title)
      ); // Sort alphabetically by id
    } catch (error) {
      console.error("Error during sync:", error);
      return oldEntries;
    }
  };
  const [timeSinceLastUpdated, setTimeSinceLastUpdated] = useState<
    number | null
  >(
    localStorage.getItem(lastUpdatedKey) != null
      ? Date.now() -
          new Date(Number(localStorage.getItem(lastUpdatedKey))).getTime()
      : null
  );
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const interval = setInterval(() => {
      const currentLastUpdated = localStorage.getItem(lastUpdatedKey);
      if (currentLastUpdated != null) {
        setTimeSinceLastUpdated(
          Date.now() - new Date(Number(currentLastUpdated)).getTime()
        );
      }
    }, 1000); // Updates the lastUpdated every second
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [lastUpdatedKey]);

  return (
    <Field.Root>
      <Button
        loading={loading}
        disabled={
          timeSinceLastUpdated != null && timeSinceLastUpdated < 5 * 1000
        } //*TODO: make this accurate, also see if we shoudl be doing difference in ms instead of lastUpdatedDatStr
        variant="subtle"
        onClick={() => {
          setLoading(true);
          if (setComponentLoading != null) {
            setComponentLoading(true);
          }
          syncEntries()
            .then((result) => {
              setEntries(result);
              localStorage.setItem(lastUpdatedKey, Date.now().toString());
              setTimeSinceLastUpdated(0);
              setLoading(false);
              if (setComponentLoading != null) {
                setComponentLoading(false);
              }
            })
            .catch((error) => {
              setLoading(false);
              if (setComponentLoading != null) {
                setComponentLoading(false);
              }
              console.error("Error during sync:", error);
            });
        }}
      >
        Refresh
      </Button>
      <Skeleton loading={loading}>
        <Field.HelperText>
          {`Last Updated: ${timeToHumanReadable(timeSinceLastUpdated)}`}
        </Field.HelperText>
      </Skeleton>
    </Field.Root>
  );
};
