import {
  Button,
  Flex,
  Image,
  Table,
  Heading,
  VStack,
  HStack,
  Box,
  Center,
  Spinner,
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
import { getAniListAuthenticatedUser } from "@/api/anilist";
import { useSearchParams } from "react-router-dom";
import { RefreshButton } from "./RefreshButton";
import { useTierListModel } from "@/context/TierListModelContext";

const refreshTimeInterval = 1000 * 60 * 60;
const lastUpdatedKey = "authenticatedLastUpdated";
const authenticatedUserKey = "authenticatedUser";
const authenticatedListKey = "authenticatedList";
const accessTokenKey = "accessToken";

//TODO: remove prints and fix extra render whenever component opens and closes.

// right now, i think we curerntly query AniList every time when this component mounts (only once per refresh)
// to see if we are authed, I think we can just use the info from localstorage unless it's old
export const SaveToWebsiteModal = () => {
  //TODO: can also put a warning if the user who is authenticated is different than the
  //      one in the tierlist
  const { tierListModel } = useTierListModel();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(
    JSON.parse(window.localStorage.getItem(authenticatedUserKey) || "null")
  );
  const [authenticatedList, setAuthenticatedList] = useState<
    TierListEntry[] | null
  >(
    JSON.parse(window.localStorage.getItem(authenticatedListKey) || "null") as
      | TierListEntry[]
      | null
  );
  const [accessToken, setAccessToken] = useState<string | null>(
    window.localStorage.getItem(accessTokenKey)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(
    localStorage.getItem(lastUpdatedKey) != null
      ? Number(localStorage.getItem(lastUpdatedKey))
      : null
  );

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const newToken = hashParams.get("access_token");
    if (!newToken) {
      return;
    }
    setAccessToken(newToken);
    localStorage.setItem(accessTokenKey, newToken);

    setLastUpdated(null);
  }, []);

  useEffect(() => {
    if (accessToken == null) {
      return;
    }

    if (
      lastUpdated != null &&
      Date.now() - lastUpdated <= refreshTimeInterval
    ) {
      return;
    }

    try {
      //TODO: refactor maybe
      getAniListAuthenticatedUser(accessToken)
        .then((user) => {
          setAuthenticatedUser(user);
          getList(user.site, user.name)
            .then((mediaListCollection) =>
              setAuthenticatedList(mediaListCollection.completedList)
            )
            .catch((error) =>
              console.error("Failed to fetch Authenticated user's list.", error)
            );
        }) // TODO: why does it say avatar lol
        .catch((error) =>
          console.error("Failed to fetch authenticated user:", error)
        );
      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }, [accessToken, lastUpdated]);

  useEffect(() => {
    localStorage.setItem(
      authenticatedUserKey,
      JSON.stringify(authenticatedUser)
    );
  }, [authenticatedUser]);
  useEffect(() => {
    localStorage.setItem(
      authenticatedListKey,
      JSON.stringify(authenticatedList)
    );
  }, [authenticatedList]);
  useEffect(() => {
    if (lastUpdated == null) {
      localStorage.removeItem(lastUpdatedKey);
      return;
    }
    localStorage.setItem(lastUpdatedKey, lastUpdated.toString());
  }, [lastUpdated]);

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
            {authenticatedUser != null &&
            authenticatedList != null &&
            accessToken != null
              ? ListWebsiteDisplayNames[authenticatedUser.site]
              : "Website"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          {authenticatedUser != null &&
          authenticatedList != null &&
          accessToken != null ? (
            <VStack>
              <HStack width="100%" justify={"start"} align="end">
                <Image
                  src={authenticatedUser.avatar}
                  width="100px"
                  height="100px"
                />
                <Heading>{authenticatedUser.name}</Heading>
              </HStack>
              <HStack>
                <Heading>Confirm Changes</Heading>
                <RefreshButton
                  user={authenticatedUser}
                  oldEntries={authenticatedList.map((oldEntry) => ({
                    tier: null,
                    entry: oldEntry,
                  }))}
                  setEntries={(newEntries) => {
                    setAuthenticatedList(
                      newEntries.map((newEntryData) => newEntryData.entry)
                    );
                  }}
                  lastUpdated={lastUpdated}
                  setLastUpdated={setLastUpdated}
                  setComponentLoading={setIsLoading}
                />
              </HStack>
              <Box position={"relative"} w={"100%"} h={"100%"}>
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Title</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">
                        Difference
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">
                        Old
                      </Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">
                        New
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {tierListModel.tiers
                      .map((tier) => {
                        return tier.entries.map((newEntry) => {
                          const newScore = tier.maxScore;
                          const oldEntry = authenticatedList.find(
                            (oldEntry) => oldEntry.id === newEntry.id
                          );
                          if (!oldEntry || newScore === oldEntry.score) {
                            return null;
                          }
                          return (
                            <Table.Row key={newEntry.id}>
                              <Table.Cell>{newEntry.title}</Table.Cell>
                              <Table.Cell textAlign="end">
                                {newScore - oldEntry.score}
                              </Table.Cell>
                              <Table.Cell textAlign="end">
                                {oldEntry.score}
                              </Table.Cell>
                              <Table.Cell textAlign="end">
                                {newScore}
                              </Table.Cell>
                            </Table.Row>
                          );
                        });
                      })
                      .flat()}
                  </Table.Body>
                </Table.Root>
                {(isSaving || isLoading) && (
                  <Box pos="absolute" inset="0" bg="bg/80">
                    <Center h="full">
                      <Spinner color="teal.500" />
                    </Center>
                  </Box>
                )}
              </Box>
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
                  Log in with AniList
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
            onClick={async () => {
              if (
                authenticatedUser != null &&
                authenticatedList != null &&
                accessToken != null
              ) {
                try {
                  setIsSaving(true);

                  const changedEntries = tierListModel.tiers.map((tier) => {
                    return {
                      ...tier,
                      entries: tier.entries.filter((newEntry) => {
                        // Find the corresponding old entry
                        const oldEntry = authenticatedList.find(
                          (oldEntry) => oldEntry.id === newEntry.id
                        );
                        return newEntry.score === oldEntry?.score;
                      }),
                    };
                  });
                  await saveEntries(
                    authenticatedUser.site,
                    changedEntries,
                    accessToken
                  );
                } catch (error) {
                  setIsSaving(false);
                  throw error;
                } finally {
                  console.log("TODO: Not yet implemented");
                }
                try {
                  // Fetch user avatar asynchronously
                  await getAniListAuthenticatedUser(accessToken)
                    .then((user) => {
                      // TODO: if statement might be redundant, maybe should represent logic with errors
                      if (user) {
                        setAuthenticatedUser(user);
                        getList(user.site, user.name)
                          .then((mediaListCollection) =>
                            setAuthenticatedList(
                              mediaListCollection.completedList
                            )
                          )
                          .catch((error) => console.error(error));
                      }
                    }) // TODO: why does it say avatar lol
                    .catch((error) =>
                      console.error("Failed to fetch avatar:", error)
                    );
                  localStorage.setItem(lastUpdatedKey, Date.now().toString());
                } catch (error) {
                  console.error("Invalid token:", error);
                  setIsSaving(false);
                }
                setIsSaving(false);
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
