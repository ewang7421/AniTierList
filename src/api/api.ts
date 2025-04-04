import {
  getAniListEntries,
  getAniListUserByUsername,
  AniListOAuthFields,
  saveAniListEntries,
} from "@/api/anilist.ts";
import {
  ListWebsite,
  TierListEntry,
  User,
  OAuthFields,
  TierModel,
} from "@/types/types";

export async function getList(
  site: ListWebsite,
  username: string
): Promise<{ completedList: TierListEntry[]; user: User }> {
  try {
    if (site === ListWebsite.AniList) {
      return getAniListEntries(username);
    } else {
      throw new Error("Unsupported platform");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function getUserByUsername(
  site: ListWebsite,
  username: string
): Promise<User | null> {
  try {
    if (site === ListWebsite.AniList) {
      return getAniListUserByUsername(username);
    } else {
      throw new Error("Unsupported platform");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export function getLogoURL(site: ListWebsite): string {
  console.log(site);
  try {
    if (site === ListWebsite.AniList) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/AniList_logo.svg/512px-AniList_logo.svg.png?20220330011134";
    } else {
      throw new Error("Unsupported platform");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export function getAuthURL(site: ListWebsite): string {
  try {
    if (site === ListWebsite.AniList) {
      return createOAuthURI(
        "https://AniList.co/api/v2/oauth/authorize",
        AniListOAuthFields
      );
    } else {
      throw new Error("Unsupported platform");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export function createOAuthURI(baseURL: string, options: OAuthFields): string {
  const url = new URL(baseURL);

  if (
    typeof options.clientId === "undefined" ||
    typeof options.responseType === "undefined"
  ) {
    throw new Error("invalid options");
  }

  url.searchParams.set("client_id", options.clientId.toString());

  if (typeof options.redirectUri !== "undefined") {
    url.searchParams.set("redirect_uri", options.redirectUri);
  }

  url.searchParams.set("response_type", options.responseType);

  return url.toString();
}

export async function saveEntries(
  site: ListWebsite,
  // while we currently have score as a number, considering making a type for it since AniList supports many different scoring systems.
  // Also, this changedEntries structure might be bad, consider changing it to just be stored in the tierlistentyr type (this pattern exists in other areas of the codebsae)
  tiers: TierModel[],
  accessToken: string
): Promise<void> {
  try {
    if (site === ListWebsite.AniList) {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      console.log("saving: ", tiers);
      for (let i = 0; i < tiers.length; i++) {
        // do you do this empty list check here? or in saveAniListEntries
        if (tiers[i].entries.length < 1) {
          continue;
        }
        console.log("Processing tier: ", tiers[i].maxScore);
        saveAniListEntries(tiers[i].entries, tiers[i].maxScore, accessToken);
        if (i < tiers.length - 1) {
          await delay(100);
        }
      }
      return Promise.resolve();
    } else {
      throw new Error("Unsupported platform");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
