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
import { getAnilistAuthenticatedUser } from "@/api/anilist";
import { useSearchParams } from "react-router-dom";
import { useLoadedUser } from "@/context/LoadedUserContext";
import { RefreshButton } from "./RefreshButton";

const refreshTimeInterval = 1000 * 60 * 60;

//TODO: remove prints and fix extra render whenever component opens and closes.

// right now, i think we curerntly query anilist every time when this component mounts (only once per refresh)
// to see if we are authed, I think we can just use the info from localstorage unless it's old
export const SaveToWebsiteModal = () => {
  //TODO: can also put a warning if the user who is authenticated is different than the
  //      one in the tierlist
  const lastUpdatedKey = "authenticatedLastUpdated";
  const { tierListModel } = useLoadedUser();
  const [isLoading, setIsLoading] = useState(false); // technically should create an authed user provider here
  const [searchParams, setSearchParams] = useSearchParams();
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(
    JSON.parse(window.localStorage.getItem("authenticatedUser") || "null")
  );
  const [authenticatedList, setAuthenticatedList] = useState<
    TierListEntry[] | null
  >(
    JSON.parse(window.localStorage.getItem("authenticatedList") || "null") as
      | TierListEntry[]
      | null
  );
  const [accessToken, setAccessToken] = useState<string | null>(
    window.localStorage.getItem("access_token")
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const renderTimeSinceLastUpdated = localStorage.getItem(lastUpdatedKey)
    ? Date.now() - Number(localStorage.getItem(lastUpdatedKey))
    : 0;
  //TODO: shudl this be state? We want it to be updated at the initial render i gueses
  useEffect(() => {
    console.log("access_token useEffect");
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const newToken =
      hashParams.get("access_token") ?? localStorage.getItem("access_token");

    if (!newToken) {
      return;
    }
    if (newToken !== accessToken) {
      console.log("different access tokens:");
      console.log("newToken: ", newToken);
      console.log("accessToken: ", accessToken);
      setAccessToken(newToken);
    }
    localStorage.setItem("access_token", newToken);

    // Handle last updated timestamp
    const lastUpdatedStr = localStorage.getItem(lastUpdatedKey);
    if (lastUpdatedStr) {
      const lastUpdatedDate = new Date(Number(lastUpdatedStr));
      const timeSinceLastUpdated = Date.now() - lastUpdatedDate.getTime();

      if (timeSinceLastUpdated > 0) {
        localStorage.setItem(lastUpdatedKey, Date.now().toString());
      }

      if (timeSinceLastUpdated > refreshTimeInterval) {
        //TODO: implement refetching authenticated lists
      }
    }
  }, [accessToken]);

  useEffect(() => {
    console.log("accessToken, renderTime");
    if (
      accessToken == null ||
      renderTimeSinceLastUpdated < refreshTimeInterval
    ) {
      return;
    }
    try {
      //TODO: refactor maybe
      // Fetch user avatar asynchronously
      getAnilistAuthenticatedUser(accessToken)
        .then((user) => {
          setAuthenticatedUser(user);
          getList(user.site, user.name)
            .then((mediaListCollection) =>
              setAuthenticatedList(mediaListCollection.completedList)
            )
            .catch((error) => console.error(error));
        }) // TODO: why does it say avatar lol
        .catch((error) => console.error("Failed to fetch avatar:", error));
      localStorage.setItem(lastUpdatedKey, Date.now().toString());
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }, [accessToken, renderTimeSinceLastUpdated]);

  useEffect(() => {
    console.log("authenticatedUser");
    localStorage.setItem(
      "authenticatedUser",
      JSON.stringify(authenticatedUser)
    );
  }, [authenticatedUser]);
  useEffect(() => {
    console.log("authenticatedList");
    localStorage.setItem(
      "authenticatedList",
      JSON.stringify(authenticatedList)
    );
  }, [authenticatedList]);
  const isAuthenticated =
    authenticatedUser != null &&
    authenticatedList != null &&
    accessToken != null;
  console.log("render");
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
                />
                <Heading>{authenticatedUser.name}</Heading>
              </HStack>
              <HStack>
                <Heading>Confirm Changes</Heading>
                <RefreshButton
                  user={authenticatedUser}
                  oldEntries={authenticatedList}
                  setEntries={setAuthenticatedList}
                  lastUpdatedKey={lastUpdatedKey}
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
            onClick={async () => {
              if (isAuthenticated && accessToken != null) {
                try {
                  console.log("clicked");
                  setIsSaving(true);
                  await saveEntries(
                    authenticatedUser.site,
                    tierListModel.tiers,
                    accessToken
                  );
                } catch (error) {
                  setIsSaving(false);
                  throw error;
                } finally {
                }
                try {
                  // Fetch user avatar asynchronously
                  const access_token = localStorage.getItem("access_token");
                  if (access_token == null) {
                    throw Error("no access token");
                  }
                  await getAnilistAuthenticatedUser(access_token)
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
