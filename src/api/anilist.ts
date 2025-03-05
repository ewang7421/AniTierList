import type { TierListEntry, AniListResponse, List, Entry } from "@/types/types";

// Here we define our query as a multi-line string
// Storing it in a separate .graphql/.gql file is also possible
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

// Make the HTTP Api request
export async function getList(username: string): Promise<TierListEntry[]> {
  // Define our query variables and values that will be used in the query request
  const variables = {
    userName: username,
  };
  // Define the config we'll need for our Api request
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
    return {} as TierListEntry[];
  }
}

async function handleResponse(response: Response) {
  const json = await response.json();
  return response.ok ? json : Promise.reject(json);
}

function handleData(data: AniListResponse): TierListEntry[] {
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
  alert("Error, check console");
  console.error(error);
}
