import {
  getAnilistEntries,
  getAnilistUserById,
  getAnilistUserByUsername,
  AnilistOAuthFields,
} from "@/api/anilist";
import { ListWebsite, TierListEntry, User, OAuthFields } from "@/types/types";

export async function getList(site: ListWebsite, username: string): Promise<TierListEntry[]> {
  try {
    if (site === ListWebsite.AniList) {
      return getAnilistEntries(username);
    } else {
      throw new Error("Unsupported platform");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function getUserByUsername(site: ListWebsite, username: string): Promise<User | null> {
  try {
    if (site === ListWebsite.AniList) {
      return getAnilistUserByUsername(username);
    } else {
      throw new Error("Unsupported platform");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function getUserById(site: ListWebsite, id: number): Promise<User | null> {
  try {
    if (site === ListWebsite.AniList) {
      return getAnilistUserById(id);
    } else {
      throw new Error("Unsupported platform");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export function getLogoURL(site: ListWebsite): string {
  try {
    if (site === ListWebsite.AniList) {
      return "https://docs.anilist.co/anilist.png";
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
      return createOAuthURI("https://anilist.co/api/v2/oauth/authorize", AnilistOAuthFields);
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

  if (typeof options.clientId === "undefined" || typeof options.responseType === "undefined") {
    throw new Error();
  }

  url.searchParams.set("client_id", options.clientId.toString());

  if (typeof options.redirectUri !== "undefined") {
    url.searchParams.set("redirect_uri", options.redirectUri);
  }

  url.searchParams.set("response_type", options.responseType);

  return url.toString();
}
