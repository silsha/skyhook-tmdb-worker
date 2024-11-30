import { Hono } from "hono";
import { env } from "hono/adapter";
import * as Promise from "bluebird";
import {
  SkyhookSearchItem,
  SkyhookShowsResponse,
  TmdbDetailsResponse,
  TmdbExternalIds,
  TmdbSearchResponse,
  TmdbSeasonResponse,
} from "../types";

const app = new Hono({ strict: false });

app.get("/v1/tmdb/search/en", async (c) => {
  const { TMDB_ACCESS_TOKEN } = env<{ TMDB_ACCESS_TOKEN: string }>(c);
  const term = c.req.query("term");
  console.log({ term: term });
  if (!term) {
    return c.json([]);
  }
  const searchRes: TmdbSearchResponse = await fetch(
    `https://api.themoviedb.org/3/search/tv?language=en-US&query=${term}&page=1&include_adult=false`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      },
    }
  ).then((res) => res.json());
  const results = await Promise.all(
    searchRes.results.map(async (tv) => {
      const details: TmdbDetailsResponse = await fetch(
        `https://api.themoviedb.org/3/tv/${tv.id}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          },
        }
      ).then((res) => res.json());
      const externalIds: TmdbExternalIds = await fetch(
        `https://api.themoviedb.org/3/tv/${tv.id}/external_ids`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          },
        }
      ).then((res) => res.json());
      const skyhookShow: SkyhookShowsResponse = await fetch(
        `https://skyhook.sonarr.tv/v1/tvdb/shows/en/${externalIds.tvdb_id}`
      ).then((res) => res.json());
      return {
        tvdbId: tv.id,
        title: details.name,
        overview: details.overview,
        slug: skyhookShow.slug,
        originalCountry: skyhookShow.originalCountry,
        originalLanguage: skyhookShow.originalLanguage,
        language: skyhookShow.language,
        firstAired: details.first_air_date,
        lastAired: details.last_air_date,
        tvRageId: skyhookShow.tvRageId,
        tvMazeId: skyhookShow.tvMazeId,
        tmdbId: details.id,
        imdbId: externalIds.imdb_id,
        lastUpdated: skyhookShow.lastUpdated,
        status: skyhookShow.status,
        runtime: details.last_episode_to_air.runtime,
        timeOfDay: skyhookShow.timeOfDay,
        originalNetwork: details.networks?.[0].name,
        network: details.networks?.[0].name,
        genres: details.genres.map((g) => g.name),
        contentRating: skyhookShow.contentRating,
        rating: {
          count: details.vote_count,
          value: details.vote_average.toString(),
        },
        alternativeTitles: skyhookShow.alternativeTitles,
        actors: skyhookShow.actors,
        images: skyhookShow.images,
        seasons: details.seasons.map((s) => {
          return {
            seasonNumber: s.season_number,
            images: [
              {
                coverType: "Poster",
                url: `https://image.tmdb.org/t/p/w500${s.poster_path}`,
              },
            ],
          };
        }),
      } as SkyhookSearchItem;
    })
  );
  return c.json(results);
});
app.get("/v1/tmdb/shows/en/:id", async (c) => {
  const { TMDB_ACCESS_TOKEN } = env<{ TMDB_ACCESS_TOKEN: string }>(c);
  const id = Number(c.req.param("id"));
  console.log({ id: id });
  const details: TmdbDetailsResponse = await fetch(
    `https://api.themoviedb.org/3/tv/${id}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      },
    }
  ).then((res) => res.json());
  const externalIds: TmdbExternalIds = await fetch(
    `https://api.themoviedb.org/3/tv/${id}/external_ids`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      },
    }
  ).then((res) => res.json());
  const skyhookShow: SkyhookShowsResponse = await fetch(
    `https://skyhook.sonarr.tv/v1/tvdb/shows/en/${externalIds.tvdb_id}`
  ).then((res) => res.json());
  const seasons = await Promise.all(
    details.seasons.map(async (s) => {
      const season: TmdbSeasonResponse = await fetch(
        `https://api.themoviedb.org/3/tv/${details.id}/season/${s.season_number}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          },
        }
      ).then((res) => res.json());
      return season;
    })
  );
  const result: SkyhookShowsResponse = {
    tvdbId: id,
    title: details.name,
    overview: details.overview,
    slug: skyhookShow.slug,
    originalCountry: skyhookShow.originalCountry,
    originalLanguage: skyhookShow.originalLanguage,
    language: skyhookShow.language,
    firstAired: details.first_air_date,
    lastAired: details.last_air_date,
    tvRageId: skyhookShow.tvRageId,
    tvMazeId: skyhookShow.tvMazeId,
    tmdbId: details.id,
    imdbId: externalIds.imdb_id,
    lastUpdated: skyhookShow.lastUpdated,
    status: skyhookShow.status,
    runtime: details.last_episode_to_air.runtime,
    timeOfDay: skyhookShow.timeOfDay,
    originalNetwork: details.networks?.[0].name,
    network: details.networks?.[0].name,
    genres: details.genres.map((g) => g.name),
    contentRating: skyhookShow.contentRating,
    rating: {
      count: details.vote_count,
      value: details.vote_average.toString(),
    },
    alternativeTitles: skyhookShow.alternativeTitles,
    actors: skyhookShow.actors,
    images: skyhookShow.images,
    seasons: details.seasons.map((s) => {
      return {
        seasonNumber: s.season_number,
        images: [
          {
            coverType: "Poster",
            url: `https://image.tmdb.org/t/p/w500${s.poster_path}`,
          },
        ],
      };
    }),
    episodes: seasons.flatMap((s) => {
      return s.episodes.map((e) => {
        return {
          tvdbShowId: details.id,
          tvdbId: e.id,
          seasonNumber: e.season_number,
          episodeNumber: e.episode_number,
          title: e.name,
          airDate: e.air_date,
          runtime: e.runtime,
          overview: e.overview,
          image: `https://image.tmdb.org/t/p/w500${e.still_path}`,
        };
      });
    }),
  };
  return c.json(result);
});
export default app;
