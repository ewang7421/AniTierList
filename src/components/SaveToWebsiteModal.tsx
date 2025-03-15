import {
  Button,
  Flex,
  Image,
  Table,
  Heading,
  VStack,
  HStack,
} from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TierListEntry,
  ListWebsite,
  User,
  ListWebsiteDisplayNames,
} from "@/types/types";
import { getAuthURL, getList, saveEntries } from "@/api/api";
import { useEffect } from "react";
import { useState } from "react";
import { getAnilistAuthenticatedUser } from "@/api/anilist";
import { useSearchParams } from "react-router-dom";
import { useLoadedUser } from "@/context/LoadedUserContext";

const cachedAuthenticatedUser: User | null = JSON.parse(
  window.localStorage.getItem("AniTierList:saveModal:authenticatedUser") ||
    "null"
) as User | null;

const cachedAuthenticatedList: TierListEntry[] | null = JSON.parse(
  window.localStorage.getItem("AniTierList:saveModal:authenticatedList") ||
    "null"
) as TierListEntry[] | null;

const lastUpdated: number | null = window.localStorage.getItem(
  "AniTierList:saveModal:authenticatedLastUpdated"
);

export const SaveToWebsiteModal = () => {
  //TODO: can also put a warning if the user who is authenticated is different than the
  //      one in the tierlist
  const { tierListModel } = useLoadedUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(
    cachedAuthenticatedUser
  );
  const [authenticatedList, setAuthenticatedList] = useState<
    TierListEntry[] | null
  >(cachedAuthenticatedList);
  let accessToken = searchParams.get("access_token");
  if (accessToken == null) {
    accessToken = localStorage.getItem("access_token");
  }
  const isAuthenticated =
    authenticatedUser != null &&
    authenticatedList != null &&
    accessToken != null;
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Get the access token from searchparams
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    let accessToken = hashParams.get("access_token");
    if (accessToken != null) {
      // set new access token to localstorage if found
      localStorage.setItem("access_token", accessToken);
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    } else {
      accessToken = localStorage.getItem("access_token");
    }

    if (accessToken == null) {
      return;
    }

    try {
      // Fetch user avatar asynchronously
      getAnilistAuthenticatedUser(accessToken)
        .then((user) => {
          //todo: if statement might be redundant, maybe should represent logic with errors
          if (user) {
            setAuthenticatedUser(user);
            getList(user.site, user.name)
              .then((mediaListCollection) =>
                setAuthenticatedList(mediaListCollection.completedList)
              )
              .catch((error) => console.error(error));
          }
        })
        .catch((error) => console.error("Failed to fetch avatar:", error));
      localStorage.set(
        "AniTierList:saveModal:authenticatedLastUpdated",
        new Date().toISOString
      );
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }, []);

  return (
    <DialogRoot
      lazyMount
      open={searchParams.get("saveModalOpen") === "true"}
      onOpenChange={(e) =>
        setSearchParams((prev) => {
          prev.set("saveModalOpen", e.open.toString());
          return prev;
        })
      }
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Save
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Save to{" "}
            {isAuthenticated
              ? ListWebsiteDisplayNames[authenticatedUser.site]
              : "Website"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          {isAuthenticated ? (
            <VStack>
              <HStack width="100%" justify={"start"} align="end">
                <Image
                  src={authenticatedUser.avatar}
                  width="100px"
                  height="100px"
                />{" "}
                <Heading>{authenticatedUser.name}</Heading>
              </HStack>
              <Heading>Confirm Changes</Heading>
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Title</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                      Difference
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Old</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">New</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {tierListModel.tiers.map((tier) => {
                    return tier.entries.map((changedEntry) => {
                      // Find the corresponding old entry
                      const oldEntry = authenticatedList.find(
                        (oldEntry) => oldEntry.id === changedEntry.id
                      );
                      const newScore = tier.maxScore;
                      return (
                        <Table.Row key={changedEntry.id}>
                          <Table.Cell>{changedEntry.title}</Table.Cell>
                          <Table.Cell textAlign="end">
                            {oldEntry ? newScore - oldEntry.score : ""}
                          </Table.Cell>
                          <Table.Cell textAlign="end">
                            {oldEntry ? oldEntry.score : ""}
                          </Table.Cell>
                          <Table.Cell textAlign="end">{newScore}</Table.Cell>
                        </Table.Row>
                      );
                    });
                  })}
                </Table.Body>
              </Table.Root>
            </VStack>
          ) : (
            <Flex direction="column" gap={2}>
              <p>
                Log in to an account to update your ratings based on this tier
                list.
              </p>
              <Button
                variant={"subtle"}
                style={{ backgroundColor: "#2e51a2", color: "white" }}
              >
                Log in with MyAnimeList
              </Button>
              <Button
                variant={"subtle"}
                style={{ backgroundColor: "#1e2630", color: "white" }}
                asChild
              >
                <a href={getAuthURL(ListWebsite.AniList)}>
                  Log in with Anilist
                </a>
              </Button>
            </Flex>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="subtle">Cancel</Button>
          </DialogActionTrigger>
          <Button
            variant="subtle"
            onClick={() => {
              if (isAuthenticated) {
                try {
                  setIsSaving(true);
                  saveEntries(
                    authenticatedUser.site,
                    tierListModel.tiers,
                    accessToken
                  );
                } catch (error) {
                  throw error;
                } finally {
                  setIsSaving(false);
                }
              }
            }}
            loading={isSaving}
          >
            Save
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};
