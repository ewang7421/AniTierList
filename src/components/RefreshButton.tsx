import { TierListEntry, User } from "@/types/types";
import { Field, Button, Skeleton } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { timeDifferenceToHumanReadable } from "@/utils/DateUtils";
import { syncEntries } from "@/utils/TierListModelUtils";

interface RefreshButtonProps {
  user: User;
  oldEntries: { tier: number | null; entry: TierListEntry }[];
  setEntries: (
    entries: { tier: number | null; entry: TierListEntry }[]
  ) => void;
  lastUpdated: number | null;
  setLastUpdated: React.Dispatch<React.SetStateAction<number | null>>;
  setComponentLoading: React.Dispatch<React.SetStateAction<boolean>> | null;
}

const refreshCooldown = 5 * 1000; // If we want, we can include this as a prop

export const RefreshButton = ({
  user,
  oldEntries,
  setEntries,
  lastUpdated,
  setLastUpdated,
  setComponentLoading,
}: RefreshButtonProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [timeSinceLastUpdated, setTimeSinceLastUpdated] = useState<
    number | null
  >(lastUpdated != null ? Date.now() - lastUpdated : null);
  useEffect(() => {
    if (lastUpdated === null) return;

    const interval = setInterval(() => {
      setTimeSinceLastUpdated(Date.now() - lastUpdated);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <Field.Root width="auto" marginEnd={"auto"}>
      <Button
        loading={loading}
        disabled={
          lastUpdated != null && Date.now() - lastUpdated < refreshCooldown
        } //*TODO: make this accurate, also see if we shoudl be doing difference in ms instead of lastUpdatedDatStr
        variant="subtle"
        onClick={() => {
          setLoading(true);
          if (setComponentLoading != null) {
            setComponentLoading(true);
          }
          syncEntries(user, oldEntries)
            .then((result) => {
              setEntries(result);
              setLastUpdated(Date.now());
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
          {`Last Updated: ${
            timeSinceLastUpdated == null
              ? "N/A"
              : timeDifferenceToHumanReadable(timeSinceLastUpdated)
          }`}
        </Field.HelperText>
      </Skeleton>
    </Field.Root>
  );
};
