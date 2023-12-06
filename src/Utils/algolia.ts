import algoliasearch from "algoliasearch";

export type AlgoliaHitHierarchy = {
  lvl0: string | null;
  lvl1: string | null;
  lvl2: string | null;
  lvl3: string | null;
  lvl4: string | null;
  lvl5: string | null;
  lvl6: string | null;
};

export type AlgoliaHit = {
  anchor: string;
  content: string | null;
  hierarchy: AlgoliaHitHierarchy;
  objectID: string;
  url: string;
};

export const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID as string,
  process.env.ALGOLIA_SEARCH_API as string,
);

export const algoliaIndex = algoliaClient.initIndex(
  process.env.ALGOLIA_INDEX as string,
);
