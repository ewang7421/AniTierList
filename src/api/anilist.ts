import {
  type TierListEntry,
  type AniListResponse,
  type AnilistUserResponse,
  type List,
  type Entry,
  type User,
  ListWebsite,
  type OAuthFields,
} from "@/types/types";

// Here we define our query as a multi-line string
// Storing it in a separate .graphql/.gql file is also possible

// Make the HTTP Api request
export async function getAnilistEntries(username: string): Promise<TierListEntry[]> {
  const query = `
query ($userName: String) { # Define which variables will be used in the query (id)
  MediaListCollection (userName: $userName, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
    user {
      id
    }
    lists {
      status
      isCustomList
      entries {
        score(format: POINT_10_DECIMAL)
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
  };
  return getAnilistData<TierListEntry[]>(query, variables, handleListResponse, handleListData);
}

export async function getAnilistUserByUsername(username: string): Promise<User | null> {
  const query = `
query ($userName: String) {
  User(search: $userName) {
    name
    avatar {
      medium
    }
  }
}
`;
  const variables = {
    userName: username,
  };

  return getAnilistData<User | null>(query, variables, handleUserResponse, handleUserData);
}

export async function getAnilistUserById(id: number): Promise<User | null> {
  const query = `
query ($userId: Int) {
  User(id: $userId) {
    name
    avatar {
      medium
    }
  }
}
`;
  const variables = {
    userId: id,
  };

  return getAnilistData<User | null>(query, variables, handleResponse, handleUserData);
}

//TODO: refactor this or consider refactoring entire getAnilistData thing
export async function getAnilistAuthenticatedUser(accessToken: string): Promise<User | null> {
  const query = `
{
  Viewer {
    id
    name
    avatar {
      medium
    }
  }
}
  `;
  const url = "https://graphql.anilist.co",
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
  return fetch(url, options).then(handleResponse, handleError).then(handleViewerData);
}

async function handleResponse(response: Response) {
  const json = await response.json();
  return response.ok ? json : Promise.reject(json);
}

async function handleUserResponse(response: Response) {
  const json = await response.json();
  return response.ok ? json : Promise.reject(Error("User '' not found"));
}

async function handleListResponse(response: Response) {
  const json = await response.json();
  if (response.ok) {
    return json;
  } else if (response.status === 404) {
    return Promise.reject(Error("User not found"));
  }
}

function handleViewerData(data): User | null {
  console.log(data);

  if (data.errors) {
    console.error("error");
    return null;
  }

  if (data.data.Viewer) {
    return {
      name: data.data.Viewer.name,
      avatar: data.data.Viewer.avatar.medium,
      site: ListWebsite.AniList,
    };
  }
  return null;
}

function handleUserData(data: AnilistUserResponse): User | null {
  console.log(data);
  if (data.errors) {
    console.error("error");
    return null;
  }
  if (data.data.User) {
    return {
      name: data.data.User.name,
      avatar: data.data.User.avatar.medium,
      site: ListWebsite.AniList,
    };
  }

  return null;
}

function handleListData(data: AniListResponse): TierListEntry[] {
  console.log(data);
  const completedList = data.data.MediaListCollection.lists.filter(
    (list: List) => !list.isCustomList && list.status === "COMPLETED"
  )[0];
  console.log(completedList);

  const entries: TierListEntry[] = completedList.entries.map((entry: Entry) => ({
    id: entry.media.id,
    idMal: entry.media.idMal,
    title: entry.media.title.romaji,
    imageUrl: entry.media.coverImage.large,
    score: entry.score,
    tier: 0,
    isPreview: false,
  }));

  /*
  console.assert(
    data.data.MediaListCollection.lists.filter(
      (list: any) => !list.isCustomList && list.status === "COMPLETED"
    ).length === 1,
    "There can only be one completed list"
  ); */
  // let ret = { userId: data.data.MediaListCollection.user.id, entries: entries };

  return entries;
}

function handleError(error: unknown): void {
  //alert("Error, check console");
  //console.error(error);
  throw error;
}

async function getAnilistData<T>(
  query: string,
  variables: Object,
  handleResponse: (response: Response) => Promise<T>,
  handleData: (data: any) => T
): Promise<T> {
  const url = "https://graphql.anilist.co",
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

export const AnilistOAuthFields: OAuthFields = {
  clientId: "24903",
  responseType: "token",
};
