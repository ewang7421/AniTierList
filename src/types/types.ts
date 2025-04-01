import { ScoreFormat } from "./scoreFormat";
export enum ListWebsite {
  AniList = "AniList",
  MyAnimeList = "myanimelist",
}
export const ListWebsiteDisplayNames: Record<ListWebsite, string> = {
  [ListWebsite.AniList]: "AniList",
  [ListWebsite.MyAnimeList]: "MyAnimeList",
};

export const enum DroppableType {
  CONTAINER = "container",
  ENTRY = "entry",
  // Add other target types if needed
}
// A single entry in the list
export type TierListEntry = {
  // id number for the show on AniList/mal
  id: number;
  idMal?: number;
  title: string;
  imageUrl: string;
  score: number;

  //AniList entry id, probably should be refactored
  entryId: number;
};
// Represents a single tier in the tierlist
export type TierModel = {
  entries: TierListEntry[];
  name: string;
  minScore: number;
  maxScore: number;
};

// The entry that is being dragged
export type DraggedEntry = {
  entry: TierListEntry;
  previewTierIndex: number;
};

export type InventoryModel = {
  entries: TierListEntry[];
};

// The model for the tierlist
export type TierListModel = {
  scoreFormat: ScoreFormat | null;
  inventory: InventoryModel;
  tiers: TierModel[];
  dragging?: DraggedEntry;
};

// TODO: probably should add id here
export interface User {
  name: string;
  avatar: string;
  site: ListWebsite;
  scoreFormat: ScoreFormat;
}

export interface AccessTokenInfo {
  token_type: "Bearer";
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface AccessTokenError {
  error: string;
  message: string;
  hint: string;
}

export interface OAuthFields {
  clientId?: string | number;
  clientSecret?: string;
  redirectUri?: string;
  responseType?: "token" | "code";
}
