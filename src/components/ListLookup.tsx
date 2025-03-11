import { ListWebsite } from "@/types/types";
import {
  HStack,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  createListCollection,
  Input,
  Button,
  Field,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
//TODO: allow user to authenticate to get lists because of private entries
interface ListLookupProps {
  setInventoryCallback: (site: ListWebsite, username: string) => Promise<void>;
}

export const ListLookup = ({ setInventoryCallback }: ListLookupProps) => {
  const [username, setUsername] = useState("");
  const [listWebsite, setListWebsite] = useState<string[]>(
    JSON.parse(
      window.localStorage.getItem("AniTierList:lookupDropdown:selected") || "[]"
    )
  );
  const [selectError, setSelectError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // wrapper because select's event represents a list of selected items, not a singular one
  const callbackWrapper = async () => {
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
      await setInventoryCallback(site, username);
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
    <HStack align="flex-start" minHeight="150px">
      <Field.Root invalid={selectError !== null}>
        <SelectRoot
          variant="subtle"
          collection={listWebsites}
          value={[listWebsite.toString()]}
          onValueChange={(e) => {
            setListWebsite(e.value);
          }}
          minWidth={"200px"}
          disabled={isLoading}
        >
          <SelectLabel>Website</SelectLabel>
          <SelectTrigger>
            <SelectValueText placeholder="Choose Website" />
          </SelectTrigger>
          <SelectContent>
            {listWebsites.items.map((website) => (
              <SelectItem item={website} key={website.value}>
                {website.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
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
              callbackWrapper();
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
        onClick={callbackWrapper}
        loading={isLoading}
      >
        get
      </Button>
    </HStack>
  );
};

const listWebsites = createListCollection({
  items: [
    { label: "Anilist", value: ListWebsite.AniList.toString() },
    { label: "MyAnimeList", value: ListWebsite.MyAnimeList.toString() },
  ],
});
