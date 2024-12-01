# Sonarr TMDB Skyhook Worker

A Cloudflare Worker that replaces Sonarr's Skyhook API with TMDB (The Movie Database) data. This worker acts as a middleware to transform TMDB's TV show metadata into a format compatible with Sonarr's requirements.

## Features

- Replaces Sonarr's Skyhook API with TMDB data
- Supports TV show search functionality
- Provides show details including seasons and external IDs
- Compatible with Sonarr's API format
- Deployed as a Cloudflare Worker for high availability and low latency

## Prerequisites

- Node.js (Latest LTS version recommended)
- Cloudflare account
- TMDB API access token

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd skyhook
```

2. Install dependencies:
```bash
npm install
```

3. Copy the example configuration:
```bash
cp wrangler.toml.example wrangler.toml
```

4. Configure your `wrangler.toml`:
   - Add your Cloudflare account ID
   - Configure your TMDB API access token as a secret:
```bash
wrangler secret put TMDB_ACCESS_TOKEN
```

## Development

To run the worker locally:
```bash
npm run dev
```

## Deployment

To deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Configuration in Sonarr

1. Go to Sonarr's Settings > General
2. Under "TV Info Language", select "English"
3. Replace the Skyhook URL with your Cloudflare Worker URL

## API Endpoints

- `GET /v1/tmdb/search/{language}?term={searchTerm}` - Search for TV shows
- `GET /v1/tmdb/shows/{language}/{id}` - Get detailed information about a specific show

## Environment Variables

- `TMDB_ACCESS_TOKEN`: Your TMDB API access token (required)

## License

MIT
