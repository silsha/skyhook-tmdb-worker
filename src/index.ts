import { Hono } from "hono";
import { $fetch } from "ofetch";
import { env } from "hono/adapter";
import * as Promise from "bluebird";
import countries from "i18n-iso-countries";
import langs from "langs";
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
  console.log({ term, searchResCount: searchRes.results.length });
  const results = await Promise.all(
    searchRes.results.map(async (tv) => {
      const details = await $fetch<TmdbDetailsResponse>(
        `https://api.themoviedb.org/3/tv/${tv.id}`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          },
          query: {
            append_to_response: [
              "alternative_titles",
              "external_ids",
              "content_ratings",
              "images",
              "credits",
            ].join(","),
          },
        }
      );
      let skyhookShow: SkyhookShowsResponse | undefined;
      if (details.external_ids.tvdb_id) {
        skyhookShow = (await fetch(
          `https://skyhook.sonarr.tv/v1/tvdb/shows/en/${details.external_ids.tvdb_id}`
        )
          .then((res) => res.json())
          .catch((e) => {
            console.error({ tvdbId: details.external_ids.tvdb_id, error: e });
          })) as SkyhookShowsResponse;
      }
      return {
        tvdbId: tv.id,
        title: details.name,
        overview: details.overview,
        slug: details.name.replace(/[^a-zA-Z0-9]/g, "-"),
        originalCountry:
          details.origin_country[0] &&
          countries
            .alpha2ToAlpha3(details.origin_country[0].toUpperCase())
            ?.toLowerCase(),
        originalLanguage:
          details.original_language &&
          langs.where("2", details.original_language)?.[3],
        language:
          details.languages[0] && langs.where("2", details.languages[0])?.[3],
        firstAired: details.first_air_date,
        lastAired: details.last_air_date,
        tvRageId: skyhookShow?.tvRageId,
        tvMazeId: skyhookShow?.tvMazeId,
        tmdbId: details.id,
        imdbId: details.external_ids.imdb_id,
        status: details.status,
        runtime: details.last_episode_to_air.runtime,
        timeOfDay: skyhookShow?.timeOfDay,
        originalNetwork: details.networks?.[0]?.name,
        network: details.networks?.[0]?.name,
        genres: details.genres.map((g) => g.name),
        contentRating: details.content_ratings.results.find(
          (r) => r.iso_3166_1 === "US"
        )?.rating,
        rating: {
          count: details.vote_count,
          value: details.vote_average.toString(),
        },
        alternativeTitles: details.alternative_titles.results.map((r) => ({
          title: r.title,
        })),
        actors: details.credits.cast
          .filter((c) => c.known_for_department === "Acting")
          .map((c) => ({
            name: c.name,
            character: c.character,
            image: `https://image.tmdb.org/t/p/w500${c.profile_path}`,
          })),
        images: [
          {
            coverType: "Banner",
            url: `https://image.tmdb.org/t/p/w500${details.backdrop_path}`,
          },
          {
            coverType: "Poster",
            url: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
          },
          {
            coverType: "Fanart",
            url: `https://image.tmdb.org/t/p/w500${details.images.backdrops?.[0]?.file_path}`,
          },
          {
            coverType: "Clearlogo",
            url: `https://image.tmdb.org/t/p/w500${details.images.logos?.[0]?.file_path}`,
          },
        ],
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
  const details = await $fetch<TmdbDetailsResponse>(
    `https://api.themoviedb.org/3/tv/${id}`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      },
      query: {
        append_to_response: [
          "alternative_titles",
          "external_ids",
          "content_ratings",
          "images",
          "credits",
        ].join(","),
      },
    }
  );
  let skyhookShow: SkyhookShowsResponse | undefined;
  if (details.external_ids.tvdb_id) {
    skyhookShow = (await fetch(
      `https://skyhook.sonarr.tv/v1/tvdb/shows/en/${details.external_ids.tvdb_id}`
    )
      .then((res) => res.json())
      .catch((e) => {
        console.error({ tvdbId: details.external_ids.tvdb_id, error: e });
      })) as SkyhookShowsResponse;
  }
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
  const result = {
    tvdbId: id,
    title: details.name,
    overview: details.overview,
    slug: details.name.replace(/[^a-zA-Z0-9]/g, "-"),
    originalCountry:
      details.origin_country[0] &&
      countries
        .alpha2ToAlpha3(details.origin_country[0].toUpperCase())
        ?.toLowerCase(),
    originalLanguage:
      details.original_language &&
      langs.where("2", details.original_language)?.[3],
    language:
      details.languages[0] && langs.where("2", details.languages[0])?.[3],
    firstAired: details.first_air_date,
    lastAired: details.last_air_date,
    tvRageId: skyhookShow?.tvRageId,
    tvMazeId: skyhookShow?.tvMazeId,
    tmdbId: details.id,
    imdbId: details.external_ids.imdb_id,
    status: details.status,
    runtime: details.last_episode_to_air.runtime,
    timeOfDay: skyhookShow?.timeOfDay,
    originalNetwork: details.networks?.[0]?.name,
    network: details.networks?.[0]?.name,
    genres: details.genres.map((g) => g.name),
    contentRating: details.content_ratings.results.find(
      (r) => r.iso_3166_1 === "US"
    )?.rating,
    rating: {
      count: details.vote_count,
      value: details.vote_average.toString(),
    },
    alternativeTitles: details.alternative_titles.results.map((r) => ({
      title: r.title,
    })),
    actors: details.credits.cast
      .filter((c) => c.known_for_department === "Acting")
      .map((c) => ({
        name: c.name,
        character: c.character,
        image: `https://image.tmdb.org/t/p/w500${c.profile_path}`,
      })),
    images: [
      {
        coverType: "Banner",
        url: `https://image.tmdb.org/t/p/w500${details.backdrop_path}`,
      },
      {
        coverType: "Poster",
        url: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
      },
      {
        coverType: "Fanart",
        url: `https://image.tmdb.org/t/p/w500${details.images.backdrops?.[0]?.file_path}`,
      },
      {
        coverType: "Clearlogo",
        url: `https://image.tmdb.org/t/p/w500${details.images.logos?.[0]?.file_path}`,
      },
    ],
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
