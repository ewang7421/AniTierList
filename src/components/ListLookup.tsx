import { ListWebsite, TierListEntry } from "@/types/types";
import {
  HStack,
  SelectItem,
  SelectValueText,
  createListCollection,
  Input,
  Button,
  Field,
  VStack,
  Image,
  Heading,
  Flex,
  Select,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { getLogoURL } from "@/api/api";
import { RefreshButton } from "./RefreshButton";
import { useTierListModel } from "@/context/TierListModelContext";
import { useLoadedUser } from "@/context/LoadedUserContext";
//TODO: allow user to authenticate to get lists because of private entries

export const ListLookup = () => {
  const { loadedUser, loadUser } = useLoadedUser();
  const { tierListModel, setTierListModel, isLoading, setIsLoading } =
    useTierListModel();
  const [username, setUsername] = useState("");
  const [listWebsite, setListWebsite] = useState<string[]>(
    JSON.parse(
      window.localStorage.getItem("AniTierList:lookupDropdown:selected") || "[]"
    )
  );
  const [selectError, setSelectError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  // wrapper because select's event represents a list of selected items, not a singular one
  const fetchListWrapper = async () => {
    setUsername("");
    setSelectError(null);
    setInputError(null);

    if (listWebsite.length < 1) {
      setSelectError("No Site Selected");
      return;
    }

    if (listWebsite.length > 1) {
      setSelectError("Unexpected Select Error");
      throw Error("Unexpected Select Error: more than one website selected");
    }

    const site = listWebsite[0] as ListWebsite;
    if (!Object.values(ListWebsite).includes(site)) {
      setSelectError("Unexpected Select Error");
      throw Error(
        "Unexpected Select Error: Selected site is not a ListWebsite"
      );
    }
    setIsLoading(true);
    try {
      await loadUser(site, username, setTierListModel);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        setInputError(error.message);
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    window.localStorage.setItem(
      "AniTierList:lookupDropdown:selected",
      JSON.stringify(listWebsite)
    );
  }, [listWebsite]);

  // TODO: In general check equality operators and make them all type strict (===)
  return (
    <VStack width={"100%"}>
      <HStack align="flex-start" minHeight="150px">
        <Field.Root invalid={selectError !== null}>
          <Select.Root
            variant="subtle"
            collection={listWebsites}
            value={[listWebsite.toString()]}
            onValueChange={(e) => {
              setListWebsite(e.value);
            }}
            minWidth={"200px"}
            disabled={isLoading}
          >
            <Select.HiddenSelect />
            <Select.Label />

            <Select.Label>Website</Select.Label>

            <Select.Control>
              <Select.Trigger>
                <SelectValueText placeholder="Choose Website" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>

            <Select.Positioner>
              <Select.Content minWidth="{200px}">
                {listWebsites.items.map((website) => (
                  <SelectItem item={website} key={website.value}>
                    {website.label}
                  </SelectItem>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
          <Field.ErrorText>{selectError}</Field.ErrorText>
        </Field.Root>
        <Field.Root invalid={inputError !== null}>
          <Field.Label></Field.Label>

          {/*TODO: fix this styling */}
          <Input
            mt={"20px"}
            minWidth={"300px"}
            placeholder="Enter your username"
            variant="subtle"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                fetchListWrapper();
              }
            }}
            autoComplete={"off"}
            disabled={isLoading}
          ></Input>
          <Field.HelperText />
          <Field.ErrorText>{inputError}</Field.ErrorText>
        </Field.Root>

        <Button
          mt="25px"
          variant="subtle"
          onClick={fetchListWrapper}
          loading={isLoading}
        >
          get
        </Button>
      </HStack>
      {loadedUser && (
        <Flex
          width="100%"
          direction="row"
          justify="center"
          align="center"
          position="relative"
          gap={4}
        >
          <Image src={loadedUser.avatar} width={"50px"} height={"50px"} />
          <Heading>{loadedUser.name}</Heading>
          <Image
            src={getLogoURL(loadedUser.site)}
            width={"50px"}
            height={"50px"}
          />
          {
            // TODO: show refresh available time like on opgg
          }
          <RefreshButton
            user={loadedUser}
            oldEntries={[
              ...tierListModel.inventory.entries.map((entry) => ({
                tier: null,
                entry: entry,
              })),
              ...tierListModel.tiers.flatMap((tier, index) =>
                tier.entries.map((entry) => ({ tier: index, entry: entry }))
              ),
            ]}
            setEntries={(newEntries) =>
              setTierListModel((prev) => {
                console.log("newEntries", newEntries);
                const newInventory = {
                  entries: newEntries
                    .filter((entryData) => entryData.tier === null)
                    .map((entryData) => entryData.entry),
                };
                const newTiers = prev.tiers.map((prevTier, index) => ({
                  ...prevTier,
                  entries: prevTier.entries.filter((prevEntry) => {
                    const newEntryData = newEntries.find(
                      (newEntryData) => newEntryData.entry.id === prevEntry.id
                    );
                    return newEntryData != null && newEntryData.tier === index;
                  }),
                }));
                return { ...prev, tiers: newTiers, inventory: newInventory };
              })
            }
            lastUpdatedKey="AniTierList:Inventory:lastUpdated"
            setComponentLoading={setIsLoading}
          />
        </Flex>
      )}
    </VStack>
  );
};

const listWebsites = createListCollection({
  items: [
    { label: "AniList", value: ListWebsite.AniList.toString() },
    { label: "MyAnimeList", value: ListWebsite.MyAnimeList.toString() },
  ],
});
