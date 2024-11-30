export type TmdbSearchResponse = {
  page: number;
  results: Array<{
    adult: boolean;
    backdrop_path: string;
    genre_ids: Array<number>;
    id: number;
    origin_country: Array<string>;
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    first_air_date: string;
    name: string;
    vote_average: number;
    vote_count: number;
  }>;
  total_pages: number;
  total_results: number;
};

export type TmdbDetailsResponse = {
  adult: boolean;
  backdrop_path: string;
  created_by: Array<{
    id: number;
    credit_id: string;
    name: string;
    original_name: string;
    gender: number;
    profile_path: string;
  }>;
  episode_run_time: Array<any>;
  first_air_date: string;
  genres: Array<{
    id: number;
    name: string;
  }>;
  homepage: string;
  id: number;
  in_production: boolean;
  languages: Array<string>;
  last_air_date: string;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    episode_type: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
  };
  name: string;
  next_episode_to_air: any;
  networks: Array<{
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }>;
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: Array<string>;
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: Array<{
    id: number;
    logo_path?: string;
    name: string;
    origin_country: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  seasons: Array<{
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    vote_average: number;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
  alternative_titles: {
    results: Array<{
      iso_3166_1: string;
      title: string;
      type: string;
    }>;
  };
  external_ids: TmdbExternalIds;
  content_ratings: {
    results: Array<{
      iso_3166_1: string;
      rating: string;
    }>;
  };
  images: {
    backdrops: Array<{
      aspect_ratio: number;
      height: number;
      iso_639_1: string;
      file_path: string;
      vote_average: number;
      vote_count: number;
      width: number;
    }>;
    logos: Array<{
      aspect_ratio: number;
      height: number;
      iso_639_1: string;
      file_path: string;
      vote_average: number;
      vote_count: number;
      width: number;
    }>;
    posters: Array<{
      aspect_ratio: number;
      height: number;
      iso_639_1: string;
      file_path: string;
      vote_average: number;
      vote_count: number;
      width: number;
    }>;
  }; 
  credits: {
    cast: Array<{
      known_for_department: string;
      name: string;
      character: string;
      profile_path: string;
    }>;
  };
};
export type TmdbSeasonResponse = {
  _id: string;
  air_date: string;
  episodes: Array<{
    air_date: string;
    episode_number: number;
    episode_type: string;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
    vote_average: number;
    vote_count: number;
    crew: Array<{
      department: string;
      job: string;
      credit_id: string;
      adult: boolean;
      gender: number;
      id: number;
      known_for_department: string;
      name: string;
      original_name: string;
      popularity: number;
      profile_path?: string;
    }>;
    guest_stars: Array<{
      character: string;
      credit_id: string;
      order: number;
      adult: boolean;
      gender: number;
      id: number;
      known_for_department: string;
      name: string;
      original_name: string;
      popularity: number;
      profile_path?: string;
    }>;
  }>;
  name: string;
  overview: string;
  id: number;
  poster_path: string;
  season_number: number;
  vote_average: number;
};

export type TmdbExternalIds = {
  id: number;
  imdb_id: string;
  freebase_mid: string;
  freebase_id: string;
  tvdb_id: number;
  tvrage_id: number;
  wikidata_id: string;
  facebook_id: string;
  instagram_id: string;
  twitter_id: string;
};
export type SkyhookSearchItem = {
  tvdbId: number;
  title: string;
  overview: string;
  slug: string;
  originalCountry: string;
  originalLanguage: string;
  language: string;
  firstAired: string;
  lastAired: string;
  tvRageId: number;
  tvMazeId: number;
  tmdbId: number;
  imdbId: string;
  lastUpdated: string;
  status: string;
  runtime: number;
  timeOfDay: {
    hours: number;
    minutes: number;
  };
  originalNetwork: string;
  network: string;
  genres: Array<string>;
  contentRating: string;
  rating: {
    count: number;
    value: string;
  };
  alternativeTitles: Array<{
    title: string;
  }>;
  actors: Array<{
    name: string;
    character: string;
    image: string;
  }>;
  images: Array<{
    coverType: string;
    url: string;
  }>;
  seasons: Array<{
    seasonNumber: number;
    images: Array<{
      coverType: string;
      url: string;
    }>;
  }>;
};

export type SkyhookShowsResponse = {
  tvdbId: number;
  title: string;
  overview: string;
  slug: string;
  originalCountry: string;
  originalLanguage: string;
  language: string;
  firstAired: string;
  lastAired: string;
  tvRageId: number;
  tvMazeId: number;
  tmdbId: number;
  imdbId: string;
  lastUpdated: string;
  status: string;
  runtime: number;
  timeOfDay: {
    hours: number;
    minutes: number;
  };
  originalNetwork: string;
  network: string;
  genres: Array<string>;
  contentRating: string;
  rating: {
    count: number;
    value: string;
  };
  alternativeTitles: Array<{
    title: string;
  }>;
  actors: Array<{
    name: string;
    character: string;
    image: string;
  }>;
  images: Array<{
    coverType: string;
    url: string;
  }>;
  seasons: Array<{
    seasonNumber: number;
    images: Array<{
      coverType: string;
      url: string;
    }>;
  }>;
  episodes: Array<{
    tvdbShowId: number;
    tvdbId: number;
    seasonNumber: number;
    episodeNumber: number;
    airedBeforeSeasonNumber?: number;
    airedBeforeEpisodeNumber?: number;
    title: string;
    airDate?: string;
    airDateUtc?: string;
    runtime: number;
    overview: string;
    image?: string;
    airedAfterSeasonNumber?: number;
    finaleType?: string;
    absoluteEpisodeNumber?: number;
  }>;
};
