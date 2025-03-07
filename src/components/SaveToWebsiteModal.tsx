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
import { TierListEntry, ListWebsite, User } from "@/types/types";
import { getAuthURL, getUserById, getList } from "@/api/api";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { getAnilistAuthenticatedUser } from "@/api/anilist";

interface SaveToWebsiteModalProps {
  changedEntries: { entry: TierListEntry; rating: number }[];
}
export const SaveToWebsiteModal = ({ changedEntries }: SaveToWebsiteModalProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [oldList, setOldList] = useState<TierListEntry[] | null>(null);

  useEffect(() => {
    // Handle OAuth token in URL
    const params = new URLSearchParams(window.location.hash.substring(1));
    const newAccessToken = params.get("access_token");

    if (newAccessToken) {
      localStorage.setItem("access_token", newAccessToken);
      window.history.replaceState({}, document.title, "/dashboard"); // Remove token from URL
    }
    const accessToken = window.localStorage.getItem("access_token");

    if (accessToken) {
      try {
        const id = jwtDecode<{ sub: string }>(accessToken).sub;

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
  }, []);

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Save
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to Website</DialogTitle>
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
                    <Table.ColumnHeader textAlign="end">Old</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">New</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {/* check react-table for sorted tables =, also consider having a toggle/radio to show/hide unchanged entries*/}
                  {changedEntries.map((changed) => {
                    const oldEntry = oldList?.find((oldEntry) => oldEntry.id === changed.entry.id);
                    return (
                      <Table.Row key={changed.entry.id}>
                        <Table.Cell>{changed.entry.title}</Table.Cell>
                        <Table.Cell textAlign="end">{oldEntry ? oldEntry.score : ""}</Table.Cell>
                        <Table.Cell textAlign="end">{changed.rating}</Table.Cell>
                      </Table.Row>
                    );
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
          <Button variant="subtle">Save</Button>
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
