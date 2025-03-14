export enum ListWebsite {
  AniList = "anilist",
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
  // id number for the show on anilist/mal
  id: number;
  idMal?: number;
  title: string;
  imageUrl: string;
  score: number;
  tierIndex: "inventory" | number;

  //anilist entry id, probably should be refactored
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
  inventory: InventoryModel;
  tiers: TierModel[];
  dragging?: DraggedEntry;
};

export interface Media {
  id: number;
  idMal?: number;
  coverImage: {
    large: string;
    medium: string;
  };
  title: {
    romaji: string;
  };
}

export interface Entry {
  score: number;
  media: Media;
  id: number;
}

export interface List {
  status: string;
  isCustomList: boolean;
  entries: Entry[];
}

export interface MediaListCollection {
  user: {
    id: number;
    name: string;
    avatar: {
      medium: string;
    };
  };
  lists: List[];
}

export interface AniListResponse {
  data: {
    MediaListCollection: MediaListCollection;
  };
}

export interface AnilistUserResponse {
  errors?: AnilistError[];
  data: {
    User: {
      name: string;
      avatar: {
        medium: string;
      };
    } | null;
  };
}

interface AnilistError {
  message: string;
  status: string;
  //locations: [];
}

// TODO: probably should add id here
export interface User {
  name: string;
  avatar: string;
  site: ListWebsite;
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
