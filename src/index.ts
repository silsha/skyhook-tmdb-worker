import { Hono } from "hono";
import { cache } from "hono/cache";
import { $fetch } from "ofetch";
import { env } from "hono/adapter";
import * as Promise from "bluebird";
import countries from "i18n-iso-countries";
import langs from "langs";
import {
  SkyhookSearchItem,
  TmdbDetailsResponse,
  TmdbSearchResponse,
  TmdbSeasonResponse,
} from "../types";

const app = new Hono({ strict: false });
app.get(
  "*",
  cache({
    cacheName: (c) => c.req.url,
    cacheControl: "max-age=3600",
  })
);
app.get("/v1/tmdb/search/:lang", async (c) => {
  const { TMDB_ACCESS_TOKEN } = env<{ TMDB_ACCESS_TOKEN: string }>(c);
  const term = c.req.query("term");
  const lang = c.req.param("lang");
  if (!term) {
    return c.json([]);
  }
  const searchRes = await $fetch<TmdbSearchResponse>(
    `https://api.themoviedb.org/3/search/tv`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      },
      query: {
        language: lang,
        query: term,
        page: 1,
        include_adult: false,
      },
    }
  );
  console.log({ term, lang, searchResCount: searchRes.results.length });
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
            language: lang,
          },
        }
      );
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
          langs.where("1", details.original_language)?.[3],
        language:
          details.languages[0] && langs.where("1", details.languages[0])?.[3],
        firstAired: details.first_air_date,
        lastAired: details.last_air_date,
        tmdbId: details.id,
        imdbId: details.external_ids.imdb_id,
        status: details.status,
        runtime: details.last_episode_to_air.runtime,
        originalNetwork: details.networks?.[0]?.name,
        network: details.networks?.[0]?.name,
        genres: details.genres.map((g) => g.name),
        contentRating: details.content_ratings.results.find(
          (r) => r.iso_3166_1 === "US"
        )?.rating,
        rating: {
          count: details.vote_count,
          value: details.vote_average.toFixed(3),
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
app.get("/v1/tmdb/shows/:lang/:id", async (c) => {
  const { TMDB_ACCESS_TOKEN } = env<{ TMDB_ACCESS_TOKEN: string }>(c);
  const id = Number(c.req.param("id"));
  const lang = c.req.param("lang");
  console.log({ id, lang });
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
        language: lang,
      },
    }
  );
  const seasons = await Promise.all(
    details.seasons.map((s) =>
      $fetch<TmdbSeasonResponse>(
        `https://api.themoviedb.org/3/tv/${details.id}/season/${s.season_number}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
          },
        }
      )
    )
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
      langs.where("1", details.original_language)?.[3],
    language:
      details.languages[0] && langs.where("1", details.languages[0])?.[3],
    firstAired: details.first_air_date,
    lastAired: details.last_air_date,
    tmdbId: details.id,
    imdbId: details.external_ids.imdb_id,
    status: details.status,
    runtime: details.last_episode_to_air.runtime,
    originalNetwork: details.networks?.[0]?.name,
    network: details.networks?.[0]?.name,
    genres: details.genres.map((g) => g.name),
    contentRating: details.content_ratings.results.find(
      (r) => r.iso_3166_1 === "US"
    )?.rating,
    rating: {
      count: details.vote_count,
      value: details.vote_average.toFixed(3),
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
