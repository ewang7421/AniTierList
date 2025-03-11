import {
  Button,
  createListCollection,
  Box,
  Flex,
  ListCollection,
  Image,
  Table,
  Text,
  Heading,
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
  TierModel,
} from "@/types/types";
import { getAuthURL, getList, saveEntries } from "@/api/api";
import { useEffect } from "react";
import { useState } from "react";
import { getAnilistAuthenticatedUser } from "@/api/anilist";

interface SaveToWebsiteModalProps {
  tiers: TierModel[];
}
export const SaveToWebsiteModal = ({ tiers }: SaveToWebsiteModalProps) => {
  //TODO: can also put a warning if the user who is authenticated is different than the 
  //      one in the tierlist
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [oldList, setOldList] = useState<TierListEntry[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // TODO: potentially remove this open check and open from dependency array because
    // it's rlly bad in strictmode.
    // but also make sure to not update this every time you open and close the modal?
    // idk it's pretty horrible perf wise but justifiable to some degree?
    if (!open) {
      return;
    }
    // OAuth token in URL
    const params = new URLSearchParams(window.location.hash.substring(1));
    const newAccessToken = params.get("access_token");

    if (newAccessToken) {
      localStorage.setItem("access_token", newAccessToken);
      window.history.replaceState({}, document.title, "/"); // Remove token from URL
    }
    const accessToken = window.localStorage.getItem("access_token");

    if (accessToken) {
      try {
        // Fetch user avatar asynchronously
        getAnilistAuthenticatedUser(accessToken)
          .then((user) => {
            //todo: if statement might be redundant, maybe should represent logic with errors
            if (user) {
              setUser(user);
              setIsAuthenticated(true);
              getList(user.site, user.name)
                .then((list) => setOldList(list))
                .catch((error) => console.error(error));
            }
          })
          .catch((error) => console.error("Failed to fetch avatar:", error));
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, [open]);

  return (
    <DialogRoot lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Save
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Save to {isAuthenticated && user ? ListWebsiteDisplayNames[user.site] : "Website"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          {isAuthenticated ? (
            <>
              <Image src={user ? user.avatar : "#"} /> <Text>{user?.name}</Text>
              <Heading>Confirm Changes</Heading>
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Title</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Difference</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">Old</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">New</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {tiers.map((tier) => {
                    return tier.entries.map((changedEntry) => {
                      // Find the corresponding old entry
                      const oldEntry = oldList?.find((oldEntry) => oldEntry.id === changedEntry.id);
                      const newScore = tier.maxScore;
                      return (
                        <Table.Row key={changedEntry.id}>
                          <Table.Cell>{changedEntry.title}</Table.Cell>
                          <Table.Cell textAlign="end">
                            {oldEntry ? newScore - oldEntry.score : ""}
                          </Table.Cell>
                          <Table.Cell textAlign="end">{oldEntry ? oldEntry.score : ""}</Table.Cell>
                          <Table.Cell textAlign="end">{newScore}</Table.Cell>
                        </Table.Row>
                      );
                    });
                  })}
                </Table.Body>
              </Table.Root>
            </>
          ) : (
            <Flex direction="column" gap={2}>
              <p>Log in to an account to update your ratings based on this tier list.</p>
              <Button variant={"subtle"} style={{ backgroundColor: "#2e51a2", color: "white" }}>
                Log in with MyAnimeList
              </Button>
              <Button
                variant={"subtle"}
                style={{ backgroundColor: "#1e2630", color: "white" }}
                asChild
              >
                <a href={getAuthURL(ListWebsite.AniList)}>Log in with Anilist</a>
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
              const accessToken = window.localStorage.getItem("access_token");
              if (user && accessToken) {
                try {
                  setIsSaving(true);
                  saveEntries(user.site, tiers, accessToken);
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
const listWebsites = createListCollection({
  items: [
    { label: "Anilist", value: ListWebsite.AniList.toString() },
    { label: "MyAnimeList", value: ListWebsite.MyAnimeList.toString() },
  ],
});
