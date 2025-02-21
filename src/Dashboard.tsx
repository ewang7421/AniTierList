import {
  VStack,
  Box,
  createListCollection,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  HStack,
  Input,
  Button,
} from "@chakra-ui/react";
import { getList } from "@/anilist.tsx";
import { useState } from "react";
import { ListWebsite, TierlistModel } from "@/types.ts";
export const Dashboard = () => {
  const [username, setUsername] = useState("watermeloans");
  const [listWebsite, setListWebsite] = useState<string[]>([]);
  const [tierlistModel, setTierlistModel] = useState<TierlistModel>({
    models: [
      // the inventory is at index 0
      { entries: [], tierName: "Inventory", minScore: 0, maxScore: 10 },
      { entries: [], tierName: "A", minScore: 8, maxScore: 9 },
      { entries: [], tierName: "B", minScore: 6, maxScore: 7 },
      { entries: [], tierName: "C", minScore: 4, maxScore: 5 },
      { entries: [], tierName: "D", minScore: 2, maxScore: 3 },
      { entries: [], tierName: "F", minScore: 0, maxScore: 1 },
    ],
  });
  return (
    <Box>
      <VStack>
        <HStack align="flex-start" minHeight="150px">
          <SelectRoot
            variant="subtle"
            collection={listWebsites}
            width="275px"
            value={[listWebsite?.toString()]}
            onValueChange={(e) => setListWebsite(e.value)}
          >
            <SelectLabel>Choose Website</SelectLabel>
            <SelectTrigger>
              <SelectValueText placeholder="Select Website" />
            </SelectTrigger>
            <SelectContent>
              {listWebsites.items.map((website) => (
                <SelectItem item={website} key={website.value}>
                  {website.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>

          <Input
            mt="25px"
            placeholder="username"
            variant="subtle"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          ></Input>
          <Button
            mt="25px"
            variant="subtle"
            onClick={async () => {
              try {
                const entries = await getList(username); // Set the state with the fetched data
                // Set the tier list model's inventory to the fetched anime list
                const newTierModel = { ...tierlistModel.models[0], entries };
                setTierlistModel((tierlistModel) => ({
                  ...tierlistModel,
                  models: [newTierModel, ...tierlistModel.models.slice(1)],
                }));
              } catch (error) {
                console.error("Error fetching anime list:", error);
              }
            }}
          >
            get
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

const listWebsites = createListCollection({
  items: [
    { label: "Anilist", value: ListWebsite.AniList.toString() },
    { label: "MyAnimeList", value: ListWebsite.MyAnimeList.toString() },
  ],
});
