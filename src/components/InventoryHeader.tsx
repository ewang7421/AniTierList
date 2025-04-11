import { ListWebsite } from "@/types/types";
import {
  HStack,
  SelectItem,
  SelectValueText,
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
import {
  flattenTierListEntries,
  listWebsites,
  loadFlatEntries,
} from "@/utils/TierListModelUtils";
import { PageSizeRadio } from "@/components/PageSizeRadio";

const dropDownKey = "lookupDropDown";
const lastUpdatedKey = "lastUpdated";

export const InventoryHeader = () => {
  const { loadedUser, loadUser } = useLoadedUser();
  const { tierListModel, setTierListModel, isLoading, setIsLoading } =
    useTierListModel();
  const [listWebsite, setListWebsite] = useState<string[]>(
    JSON.parse(window.localStorage.getItem(dropDownKey) || "[]")
  );
  const [username, setUsername] = useState("");

  const [selectError, setSelectError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const [lastUpdated, setLastUpdated] = useState<number | null>(
    localStorage.getItem(lastUpdatedKey) != null
      ? Number(localStorage.getItem(lastUpdatedKey))
      : null
  );

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
      setLastUpdated(Date.now());
    } catch (error) {
      if (error instanceof Error) {
        //FIXME: ???
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
    window.localStorage.setItem(dropDownKey, JSON.stringify(listWebsite));
  }, [listWebsite]);

  useEffect(() => {
    if (lastUpdated == null) {
      localStorage.removeItem(lastUpdatedKey);
      return;
    }
    localStorage.setItem(lastUpdatedKey, lastUpdated.toString());
  }, [lastUpdated]);

  // TODO: In general check equality operators and make them all type strict (===)
  return (
    <VStack width={"100%"}>
      <HStack align="flex-start">
        <Field.Root invalid={selectError !== null}>
          <Select.Root
            variant="subtle"
            collection={listWebsites}
            value={listWebsite}
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
          justify="start"
          align="end"
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
          <RefreshButton
            user={loadedUser}
            oldEntries={flattenTierListEntries(tierListModel)}
            setEntries={(newEntries) =>
              setTierListModel((prev) => loadFlatEntries(prev, newEntries))
            }
            lastUpdated={lastUpdated}
            setLastUpdated={setLastUpdated}
            setComponentLoading={setIsLoading}
          />
          <PageSizeRadio />
        </Flex>
      )}
    </VStack>
  );
};
