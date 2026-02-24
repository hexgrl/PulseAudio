import express from "express";
import axios from "axios";

const router = express.Router();
const LASTFM_BASE_URL = "https://ws.audioscrobbler.com/2.0/";
const DEEZER_BASE_URL = "https://api.deezer.com";

const getLastFmApiKey = () => {
  return process.env.LASTFM_API_KEY;
};

async function getDeezerData(trackName, artistName) {
  try {
    const cleanTrack = trackName.replace(/\(.*?\)/g, "").trim();
    const cleanArtist = artistName.replace(/\(.*?\)/g, "").trim();

    const query = `${cleanArtist} ${cleanTrack}`;
    const response = await axios.get(`${DEEZER_BASE_URL}/search`, {
      params: {
        q: query,
        limit: 5,
      },
    });

    const tracks = response.data.data;
    if (!tracks || tracks.length === 0) {
      return null;
    }

    const bestMatch =
      tracks.find(
        (track) =>
          track.artist.name.toLowerCase().includes(cleanArtist.toLowerCase()) &&
          track.title.toLowerCase().includes(cleanTrack.toLowerCase()),
      ) || tracks[0];

    return {
      albumArt:
        bestMatch.album?.cover_xl ||
        bestMatch.album?.cover_big ||
        bestMatch.album?.cover_medium ||
        null,
      previewUrl: bestMatch.preview || null,
      deezerUrl: bestMatch.link || null,
    };
  } catch (error) {
    return null;
  }
}

const moodToTags = {
  happy: ["happy", "upbeat", "feel good", "party"],
  sad: ["sad", "melancholy", "heartbreak", "depressing"],
  angry: ["angry", "aggressive", "metal", "intense"],
  chill: ["chill", "relaxing", "ambient", "mellow"],
  energetic: ["energetic", "pump up", "workout", "hype"],
  romantic: ["love", "romantic", "soul", "rnb"],
  breakup: ["breakup", "heartbreak", "sad", "moving on"],
};

const moodKeywords = {
  breakup: [
    "cheat",
    "breakup",
    "ex ",
    "dumped",
    "left me",
    "she left",
    "he left",
    "moving on",
    "heartbroke",
    "broke up",
  ],
  angry: ["mad", "angry", "pissed", "furious", "frustrated", "annoyed", "rage"],
  sad: [
    "sad",
    "cry",
    "depressed",
    "down",
    "lonely",
    "miss",
    "grief",
    "lost",
    "hurt",
    "pain",
  ],
  happy: [
    "happy",
    "great",
    "excited",
    "good mood",
    "hyped",
    "stoked",
    "amazing",
  ],
  chill: [
    "chill",
    "relax",
    "calm",
    "lazy",
    "cozy",
    "vibe",
    "wind down",
    "study",
  ],
  energetic: ["energy", "pump", "workout", "run", "hype", "motivated", "grind"],
  romantic: ["love", "romantic", "crush", "date", "feelings", "miss you"],
};

const fallbackTags = [
  "indie",
  "alternative",
  "pop",
  "rock",
  "soul",
  "electronic",
  "folk",
  "hip-hop",
];

function parseMoodToTags(userInput) {
  const input = userInput.toLowerCase();
  const matchedMoods = [];

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some((kw) => input.includes(kw))) {
      matchedMoods.push(mood);
    }
  }

  const tags = [...new Set(matchedMoods.flatMap((m) => moodToTags[m]))];

  if (tags.length === 0) {
    const random =
      fallbackTags[Math.floor(Math.random() * fallbackTags.length)];
    return [random];
  }

  return tags.slice(0, 3);
}

router.post("/recommendations", async (req, res) => {
  try {
    const { mood, limit = 10 } = req.body;
    const page = req.body.page || Math.floor(Math.random() * 5) + 1;

    if (!mood) {
      return res.status(400).json({ error: "Mood is required" });
    }

    const LASTFM_API_KEY = getLastFmApiKey();
    if (!LASTFM_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const tags = parseMoodToTags(mood);
    const primaryTag = tags[Math.floor(Math.random() * tags.length)];

    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: "tag.gettoptracks",
        tag: primaryTag,
        api_key: LASTFM_API_KEY,
        format: "json",
        limit: limit,
        page: page,
      },
    });

    const lastfmTracks = response.data.tracks.track;

    const tracksWithDeezerData = await Promise.all(
      lastfmTracks.map(async (track) => {
        const deezerData = await getDeezerData(track.name, track.artist.name);
        const lastfmImage =
          track.image[3]?.["#text"] || track.image[2]?.["#text"] || "";

        return {
          name: track.name,
          artist: track.artist.name,
          url: track.url,
          image: deezerData?.albumArt || lastfmImage,
          previewUrl: deezerData?.previewUrl || null,
          deezerUrl: deezerData?.deezerUrl || null,
        };
      }),
    );

    res.json({
      tracks: tracksWithDeezerData,
      tag: primaryTag,
      allTags: tags,
      page: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

router.post("/similar", async (req, res) => {
  try {
    const { trackName, artistName, limit = 10 } = req.body;

    if (!trackName || !artistName) {
      return res
        .status(400)
        .json({ error: "Track name and artist are required" });
    }

    const LASTFM_API_KEY = getLastFmApiKey();
    if (!LASTFM_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: "track.getsimilar",
        track: trackName,
        artist: artistName,
        api_key: LASTFM_API_KEY,
        format: "json",
        limit: limit,
      },
    });

    const lastfmTracks = response.data.similartracks.track;

    const tracksWithDeezerData = await Promise.all(
      lastfmTracks.map(async (track) => {
        const deezerData = await getDeezerData(track.name, track.artist.name);
        const lastfmImage =
          track.image[3]?.["#text"] || track.image[2]?.["#text"] || "";

        return {
          name: track.name,
          artist: track.artist.name,
          url: track.url,
          match: track.match,
          image: deezerData?.albumArt || lastfmImage,
          previewUrl: deezerData?.previewUrl || null,
          deezerUrl: deezerData?.deezerUrl || null,
        };
      }),
    );

    res.json({ tracks: tracksWithDeezerData });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch similar tracks" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const LASTFM_API_KEY = getLastFmApiKey();
    if (!LASTFM_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method: "track.search",
        track: query,
        api_key: LASTFM_API_KEY,
        format: "json",
        limit: limit,
      },
    });

    const lastfmTracks = response.data.results.trackmatches.track;

    const tracksWithDeezerData = await Promise.all(
      lastfmTracks.map(async (track) => {
        const deezerData = await getDeezerData(track.name, track.artist);
        const lastfmImage =
          track.image[3]?.["#text"] || track.image[2]?.["#text"] || "";

        return {
          name: track.name,
          artist: track.artist,
          url: track.url,
          image: deezerData?.albumArt || lastfmImage,
          previewUrl: deezerData?.previewUrl || null,
          deezerUrl: deezerData?.deezerUrl || null,
        };
      }),
    );

    res.json({ tracks: tracksWithDeezerData });
  } catch (error) {
    res.status(500).json({ error: "Failed to search tracks" });
  }
});

export default router;
