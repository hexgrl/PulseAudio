# Pulse - Music Mood Search

Pulse is a mood-based music discovery app. Describe how you're feeling in plain language and get a small list back. Built with React, Express, Last.fm for track data, and Deezer for album art and 30-second previews.

I left AI out of this project to avoid runtime costs and instead built a keyword mapping system. I used Last.fm for track data since they have a long history of being used for music stats and recommendations, even before streaming was mainstream. I used Deezer to supplement album art and 30-second track previews due to Last.fm's inconsistency returning those.

## Stack

- React, Vite, Express
- Last.fm API — track data and recommendations
- Deezer API — album art and 30-second previews

## Limitations / Future Improvements

- The keyword classifier works for common moods but misses nuanced input like "bad date" or "nervous about tomorrow". A lightweight AI classifier would be the natural next step if cost weren't a factor.
- Mood results are sourced from Last.fm's tag system which can surface repetitive results for less common tags.

## Features

- Mood-based music recommendations
- Similar track discovery
- 30-second preview playback
- Links to Deezer and Last.fm

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the `api` directory:
   - Copy `api/example.env` to `api/.env`
   - Update `LASTFM_API_KEY` with your actual Last.fm API key

3. Run the development server:

```bash
npm run dev
```

4. Run the backend API server (in a separate terminal):

```bash
npm run server
```

## Scripts

- `npm run dev` - Start the Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start the Express backend server
