import {
  type TierListEntry,
  type User,
  ListWebsite,
  type OAuthFields,
} from "@/types/types";
import { ScoreFormat } from "@/types/scoreFormat";

const anilistClientId = import.meta.env.VITE_ANILIST_CLIENT_ID;
console.log(anilistClientId);

//TODO: Refactor where types live, currently they are all in types.ts but it should be better
// to move AniList types to here possibly.

interface Media {
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

interface Entry {
  score: number;
  media: Media;
  id: number;
}

interface List {
  status: string;
  isCustomList: boolean;
  entries: Entry[];
}

interface MediaListCollection {
  user: {
    id: number;
    name: string;
    avatar: {
      medium: string;
    };
    mediaListOptions: {
      scoreFormat: ScoreFormat;
    };
  };
  lists: List[];
}

type AniListResponseType =
  | AniListResponse
  | AniListUserResponse
  | AniListViewerResponse;

interface AniListResponse {
  data: {
    MediaListCollection: MediaListCollection;
  };
}

interface AniListUserResponse {
  errors?: AniListError[];
  data: {
    User: {
      mediaListOptions: {
        scoreFormat: ScoreFormat;
      };
      name: string;
      avatar: {
        medium: string;
      };
    } | null;
  };
}

interface AniListViewerResponse {
  errors?: AniListError[];
  data: {
    Viewer: {
      mediaListOptions: {
        scoreFormat: ScoreFormat;
      };
      name: string;
      avatar: {
        medium: string;
      };
    } | null;
  };
}

interface AniListError {
  message: string;
  status: string;
  //locations: [];
}

//TODO:  remove | null return types, they should error rather than null.

// Here we define our query as a multi-line string
// Storing it in a separate .graphql/.gql file is also possible

// Make the HTTP Api request
// TODO: probabyly forceSingleCompleted in the query, the only argument
// against that would be to allow users to sort by their custom completed
// scheme (idk how it works, i think by format like tv, etc)
export async function getAniListEntries(
  username: string
): Promise<{ completedList: TierListEntry[]; user: User }> {
  const query = `
query ($userName: String, $type: MediaType, $status: MediaListStatus) { # Define which variables will be used in the query (id)
  MediaListCollection (userName: $userName, type: $type, status: $status) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
    user {
      id
      name
      avatar {
        medium
      }
      mediaListOptions {
        scoreFormat
      }
    }
    lists {
      status
      isCustomList
      entries {
        id
        score
        media {
          id
          idMal
          coverImage {
            large
            medium
          }
          title {
            romaji
          }
        }
      }
    }
  }
}
`;
  // Define our query variables and values that will be used in the query request
  const variables = {
    userName: username,
    type: "ANIME",
    status: "COMPLETED",
  };
  return getAniListData<{ completedList: TierListEntry[]; user: User }>(
    query,
    variables,
    handleListResponse,
    handleListData
  );
}

export async function getAniListUserByUsername(
  username: string
): Promise<User | null> {
  const query = `
query ($userName: String) {
  User(search: $userName) {
    name
    avatar {
      medium
    }
    mediaListOptions {
      scoreFormat
    }
  }
}
`;
  const variables = {
    userName: username,
  };

  return getAniListData<User | null>(
    query,
    variables,
    handleUserResponse,
    handleUserData
  );
}

//TODO: refactor this or consider refactoring entire getAniListData thing
export async function getAniListAuthenticatedUser(
  accessToken: string
): Promise<User> {
  const query = `
{
  Viewer {
    id
    name
    avatar {
      medium
    }
    mediaListOptions {
      scoreFormat
    }
  }
}
  `;
  const url = "https://graphql.AniList.co",
    options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    };
  return fetch(url, options)
    .then(handleResponse, handleError)
    .then(handleViewerData);
}

//TODO: probably refactor access token to a getAccessToken function rather than passing it
// guaranteed to have at least 1 entry
export async function saveAniListEntries(
  changedEntries: TierListEntry[],
  newScore: number,
  accessToken: string
): Promise<void> {
  const query = `
mutation UpdateMediaListEntries($score: Float, $ids: [Int]) {
  UpdateMediaListEntries(score: $score, ids: $ids) {
    updatedAt
  }
}
`;
  const variables = {
    score: newScore,
    ids: changedEntries.map((entry) => entry.entryId),
  };

  const url = "https://graphql.AniList.co",
    options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    };
  try {
    const response = await fetch(url, options);
    await handleMutationResponse(response);
    return;
  } catch (error) {
    handleError(error);
    return;
  }
}

async function handleMutationResponse(response: Response) {
  if (response.ok) {
    return;
  } else {
    return Promise.reject(Error("error while saving"));
  }
}

async function handleResponse(response: Response) {
  const json = await response.json();
  return response.ok ? json : Promise.reject(json);
}

async function handleUserResponse(response: Response) {
  const json = await response.json();
  return response.ok ? json : Promise.reject(Error("User '' not found"));
}

async function handleListResponse(
  response: Response
): Promise<AniListResponse> {
  const json = await response.json();
  if (response.ok) {
    return json;
  } else if (response.status === 404) {
    return Promise.reject(Error("User not found"));
  } else {
    return Promise.reject(Error("Unknown Error"));
  }
}

//TODO: parameters here
function handleViewerData(data: AniListViewerResponse): User {
  console.log(data);

  if (data.errors) {
    console.error("error");
    throw Error("handleViewerData received errors");
  }

  if (data.data.Viewer != null) {
    return {
      scoreFormat: data.data.Viewer.mediaListOptions.scoreFormat,
      name: data.data.Viewer.name,
      avatar: data.data.Viewer.avatar.medium,
      site: ListWebsite.AniList,
    };
  }
  throw Error("Viewer/user is null in handleViewerData");
}

function handleUserData(data: AniListResponseType): User | null {
  //TODO: impleemnt type gurad here maybe?
  data = data as AniListUserResponse;
  console.log(data);
  if (data.errors) {
    console.error("error");
    return null;
  }
  if (data.data.User) {
    return {
      scoreFormat: data.data.User.mediaListOptions.scoreFormat,
      name: data.data.User.name,
      avatar: data.data.User.avatar.medium,
      site: ListWebsite.AniList,
    };
  }

  return null;
}

/*
  console.assert(
    data.data.MediaListCollection.lists.filter(
      (list: any) => !list.isCustomList && list.status === "COMPLETED"
    ).length === 1,
    "There can only be one completed list"
  ); */
// let ret = { userId: data.data.MediaListCollection.user.id, entries: entries };
function handleListData(data: AniListResponseType): {
  completedList: TierListEntry[];
  user: User;
} {
  data = data as AniListResponse;
  console.log(data);
  const completedList = data.data.MediaListCollection.lists.filter(
    (list: List) => !list.isCustomList && list.status === "COMPLETED"
  )[0];
  console.log(completedList);

  const entries: TierListEntry[] = completedList.entries.map(
    (entry: Entry) => ({
      id: entry.media.id,
      idMal: entry.media.idMal,
      title: entry.media.title.romaji,
      imageUrl: entry.media.coverImage.large,
      score: entry.score,
      isPreview: false,
      entryId: entry.id,
    })
  );

  const user: User = {
    scoreFormat:
      data.data.MediaListCollection.user.mediaListOptions.scoreFormat,
    name: data.data.MediaListCollection.user.name,
    avatar: data.data.MediaListCollection.user.avatar.medium,
    site: ListWebsite.AniList,
  };

  return { completedList: entries, user: user };
}

function handleError(error: unknown): void {
  //alert("Error, check console");
  //console.error(error);
  throw error;
}

async function getAniListData<T>(
  query: string,
  variables: object,
  handleResponse: (response: Response) => Promise<AniListResponseType>,
  handleData: (data: AniListResponseType) => T
): Promise<T> {
  const url = "https://graphql.AniList.co",
    options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    };
  try {
    const response = await fetch(url, options);
    const data = await handleResponse(response);
    return handleData(data);
  } catch (error) {
    handleError(error);
    return null as T;
  }
}

export const AniListOAuthFields: OAuthFields = {
  clientId: anilistClientId,
  responseType: "token",
};
