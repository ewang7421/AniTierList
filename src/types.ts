export const enum ListWebsite {
  AniList = "anilist",
  MyAnimeList = "myanimelist",
}

export const enum DraggableType {
  ENTRY = "entry",
  TIER = "tier",
  // Add other draggable types if needed
}
export const enum DroppableType {
  CONTAINER = "container",
  ENTRY = "entry",
  // Add other target types if needed
}

export const enum ContainerType {
  TIER = "tier",
  INVENTORY = "inventory",
}

// A single entry in the list
export type TierListEntry = {
  // id number for the show on anilist/mal
  id: number;
  idMal?: number;
  title: string;
  imageUrl: string;
  score: number;
  tier: number;
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
}

export interface List {
  status: string;
  isCustomList: boolean;
  entries: Entry[];
}

export interface MediaListCollection {
  user: {
    id: number;
  };
  lists: List[];
}

export interface AniListResponse {
  data: {
    MediaListCollection: MediaListCollection;
  };
}
