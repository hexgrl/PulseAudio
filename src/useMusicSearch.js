import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function apiFetch(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Failed to fetch from ${path}`);
  return response.json();
}

export function useMusicSearch() {
  const [tracks, setTracks] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (mood, page = null) => {
    if (!mood?.trim()) {
      setError("How are you feeling?");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/lastfm/recommendations", {
        mood,
        ...(page && { page }),
        limit: 10,
      });
      setTracks(shuffle(data.tracks));
      setCurrentTag(data.tag);
      setCurrentPage(data.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = (mood) => handleSearch(mood, currentPage + 1);

  const handleGetSimilar = async (trackName, artistName) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/lastfm/similar", {
        trackName,
        artistName,
        limit: 10,
      });
      setTracks(shuffle(data.tracks));
      setCurrentTag(`Similar to ${trackName}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    tracks,
    currentTag,
    currentPage,
    loading,
    error,
    handleSearch,
    handleRefresh,
    handleGetSimilar,
  };
}
