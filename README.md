# Pulse - Music Mood Search

A React application that recommends music based on your mood using Last.fm and Deezer APIs.

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

