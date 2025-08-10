export type AnimeType = "TV" | "Movie" | "Ova" | "Special" | "Ona" | "Music";
export type AnimeFilter = "Upcoming" | "Airing" | "ByPopularity";

export interface AnimeTitle {
  romaji?: string;
  english?: string;
  native?: string;
}

export interface Anime {
  malId?: number;
  aniListId?: number;
  title: AnimeTitle;
  description?: string;
  episodes?: number;
  averageScore?: number;
  coverImageLarge?: string;

  // Added fields:
  genres?: string[];
  type?: AnimeType;
}


export type TopAnimeFilter = "airing" | "upcoming" | "bypopularity" | "favorite";

export interface AnimeTopParams {
	page?: number;
	limit?: number;
	type?: AnimeType;
	filter?: TopAnimeFilter;
}

export type AnimeStatus = "Finished Airing" | "Currently Airing" | "Complete" | "Not yet aired";
export type AnimeRating = "g" | "pg" | "pg13" | "r17" | "r" | "rx";
export type AnimeSeason = "spring" | "summer" | "fall" | "winter";
export type SearchOrder = "mal_id" | "title" | "start_date" | "end_date" | "score" | "scored_by" | "rank" | "popularity" | "members" | "favorites";
export type AnimeSearchOrder = "type" | "rating" | "episodes" | SearchOrder;
export type AnimeSearchStatus = "airing" | "complete" | "upcoming";

export interface AnimeSearchParams {
	q?: string;
	page?: number;
	limit?: number;
	score?: number;
	min_score?: number;
	max_score?: number;
	sfw?: boolean;
	genres?: string;
	genres_exclude?: string;
	producers?: string;
	start_date?: string;
	end_date?: string;
	unapproved?: boolean;

	type?: AnimeType;
	status?: AnimeSearchStatus;
	rating?: AnimeRating;
	order_by?: AnimeSearchOrder;
}

export interface AnimeDataProvider {
  getTop?: (
    params: AnimeTopParams,
  ) => Promise<Anime[]>;

  getAnimeById?: (
    malId?: number,
    aniListId?: number,
  ) => Promise<Partial<Anime> | null>;

  getAnimeByName?: (title: AnimeTitle) => Promise<Partial<Anime> | null>;

  searchAnime?: (params: AnimeSearchParams) => Promise<Anime[]>;
}

// Supported language codes for subtitles and sound tracks
export type LanguageCode =
  | "en"
  | "ar"
  | "fr"
  | "jp"
  | "es"
  | "de"
  | "it"
  | "ru"
  | string;

export interface StreamingInfo {
  subs: LanguageCode[]; // subtitle languages available
  soundLangs: LanguageCode[]; // sound languages available
  quality: number; // e.g. 720, 1080
  playerHtml: string; // raw HTML string to embed player
}

export interface StreamingProvider {
  getStreamingInfo?: (
    animeName: AnimeTitle,
    aniListId?: number,
    malId?: number,
    season?: string,
    episode?: number,
  ) => Promise<StreamingInfo | null>;
}

export interface AddonManifest {
  name: string;
  version: string;
  loaderVer: string;
  description?: string;
  author?: string;
}

export interface Addon {
  manifest: AddonManifest;
  animeData?: AnimeDataProvider;
  streamingProvider?: StreamingProvider;
}

const LOADER_VERSION = "1";

export class AddonsLoader {
  private addons: Addon[] = [];

  mergeAnimes(
    ...partials: (Partial<Anime> | null | undefined)[]
  ): Anime | null {
    const merged: Anime = {} as Anime;

    let foundAny = false;

    for (const partial of partials) {
      if (!partial) continue;
      foundAny = true;

      if (!merged.malId && partial.malId) merged.malId = partial.malId;
      if (!merged.aniListId && partial.aniListId)
        merged.aniListId = partial.aniListId;

      if (!merged.title) merged.title = {};
      if (partial.title) {
        if (!merged.title.romaji && partial.title.romaji)
          merged.title.romaji = partial.title.romaji;
        if (!merged.title.english && partial.title.english)
          merged.title.english = partial.title.english;
        if (!merged.title.native && partial.title.native)
          merged.title.native = partial.title.native;
      }

      if (!merged.description && partial.description)
        merged.description = partial.description;
      if (!merged.episodes && partial.episodes)
        merged.episodes = partial.episodes;
      if (!merged.averageScore && partial.averageScore)
        merged.averageScore = partial.averageScore;
      if (!merged.coverImageLarge && partial.coverImageLarge)
        merged.coverImageLarge = partial.coverImageLarge;

      // Merge genres (simple concat + unique)
      if (partial.genres) {
        merged.genres = Array.from(
          new Set([...(merged.genres ?? []), ...partial.genres]),
        );
      }

      // Use type if not set
      if (!merged.type && partial.type) merged.type = partial.type;
    }

    return foundAny ? merged : null;
  }

  loadAddonFromCode(code: string): boolean {
    try {
      const pluginWrapper = new Function(`${code}; return addon;`);
      const plugin: Addon = pluginWrapper();

      if (!plugin?.manifest?.loaderVer) {
        console.warn("Addon missing loaderVer, skipping");
        return false;
      }
      if (plugin.manifest.loaderVer !== LOADER_VERSION) {
        console.warn(
          `Addon loaderVer mismatch (expected ${LOADER_VERSION}, got ${plugin.manifest.loaderVer}), skipping`,
        );
        return false;
      }

      this.addons.push(plugin);
      return true;
    } catch (err) {
      console.error("Error loading addon:", err);
      return false;
    }
  }

  removeAddonByName(name: string): boolean {
    const initialLength = this.addons.length;
    this.addons = this.addons.filter((a) => a.manifest.name !== name);
    return this.addons.length < initialLength;
  }

  animeData = {
    getTop: async (
    params: AnimeTopParams,
    ): Promise<Anime[]> => {
      const promises = this.addons
        .filter((a) => a.animeData?.getTop)
        .map((a) =>
          a.animeData!.getTop!(params).catch((err) => {
            console.error(
              `Error in addon ${a.manifest.name} getTrendingNow:`,
              err,
            );
            return [] as Anime[];
          }),
        );

      const results = await Promise.all(promises);
      return results.flat();
    },

    getAnimeById: async (
      malId?: number,
      aniListId?: number,
    ): Promise<Anime | null> => {
      const promises = this.addons
        .filter((a) => a.animeData?.getAnimeById)
        .map((a) =>
          a.animeData!.getAnimeById!(malId, aniListId).catch((err) => {
            console.error(
              `Error in addon ${a.manifest.name} getAnimeById:`,
              err,
            );
            return null;
          }),
        );

      const results = await Promise.all(promises);
      return this.mergeAnimes(...results);
    },

    getAnimeByName: async (title: AnimeTitle): Promise<Anime | null> => {
      const promises = this.addons
        .filter((a) => a.animeData?.getAnimeByName)
        .map((a) =>
          a.animeData!.getAnimeByName!(title).catch((err) => {
            console.error(
              `Error in addon ${a.manifest.name} getAnimeByName:`,
              err,
            );
            return null;
          }),
        );

      const results = await Promise.all(promises);
      return this.mergeAnimes(...results);
    },

    searchAnime: async ( params: AnimeSearchParams): Promise<Anime[]> => {
      const promises = this.addons
        .filter((a) => a.animeData?.searchAnime)
        .map((a) =>
          a.animeData!.searchAnime!(params).catch((err) => {
            console.error(
              `Error in addon ${a.manifest.name} searchAnime:`,
              err,
            );
            return [] as Anime[];
          }),
        );

      const results = await Promise.all(promises);
      return results.flat();
    },
  };

  streamingProvider = {
    getStreamingInfo: async (params: {
      animeName: AnimeTitle;
      aniListId?: number;
      malId?: number;
      season?: string;
      episode?: number;
    }): Promise<StreamingInfo[]> => {
      const promises = this.addons
        .filter((a) => a.streamingProvider?.getStreamingInfo)
        .map((a) =>
          a.streamingProvider!.getStreamingInfo!(
            params.animeName,
            params.aniListId,
            params.malId,
            params.season,
            params.episode,
          ).catch((err) => {
            console.error(
              `Error in addon ${a.manifest.name} getStreamingInfo:`,
              err,
            );
            return null;
          }),
        );

      const results = await Promise.all(promises);
      return results.filter((r): r is StreamingInfo => r !== null);
    },
  };

  clearAddons() {
    this.addons = [];
  }
}

const addonsLoader = new AddonsLoader();
export { addonsLoader };
