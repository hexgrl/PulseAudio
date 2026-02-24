import React, { useState, useRef } from "react";
import "./Pulse.css";

function App() {
  const [mood, setMood] = useState("");
  const [tracks, setTracks] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playingTrack, setPlayingTrack] = useState(null);
  const audioRef = useRef(null);

  const handleSearch = async (page = null) => {
    if (!mood.trim()) {
      setError("How are you feeling?");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3001/api/lastfm/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mood: mood,
            ...(page && { page }),
            limit: 10,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      const shuffled = data.tracks.sort(() => Math.random() - 0.5);
      setTracks(shuffled);
      setCurrentTag(data.tag);
      setCurrentPage(data.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    handleSearch(currentPage + 1);
  };

  const handleGetSimilar = async (trackName, artistName) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/lastfm/similar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackName,
          artistName,
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch similar tracks");
      }

      const data = await response.json();
      const shuffled = data.tracks.sort(() => Math.random() - 0.5);
      setTracks(shuffled);
      setCurrentTag(`Similar to ${trackName}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPreview = (track) => {
    if (!track.previewUrl) {
      return;
    }

    if (playingTrack === track.name) {
      audioRef.current.pause();
      setPlayingTrack(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.previewUrl;
        audioRef.current.play();
        setPlayingTrack(track.name);
      }
    }
  };

  return (
    <div className="mood-search-container">
      <h1>Pulse Audio</h1>
      <p>Tell me how you're feeling, and I'll recommend some music</p>

      <div className="search-box">
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="e.g., I'm happy and wanna dance"
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={() => handleSearch()} disabled={loading}>
          {loading ? "Searching..." : "Find Music"}
        </button>
        {tracks.length > 0 && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="refresh-btn">
            {loading ? "Loading..." : "Show More Songs"}
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {tracks.length > 0 && (
        <div className="results">
          <h2>Recommendations {currentTag && `(${currentTag})`}</h2>

          <div className="tracks-list">
            {tracks.map((track, index) => (
              <div key={index} className="track-item">
                <div className="track-image-container">
                  {track.image && (
                    <img
                      src={track.image}
                      alt={track.name}
                      className="track-image"
                    />
                  )}
                  {track.previewUrl && (
                    <button
                      className={`play-preview-btn ${playingTrack === track.name ? "playing" : ""}`}
                      onClick={() => handlePlayPreview(track)}
                      title={
                        playingTrack === track.name
                          ? "Pause"
                          : "Play 30s preview"
                      }
                      aria-label={
                        playingTrack === track.name ? "Pause" : "Play"
                      }></button>
                  )}
                </div>
                <div className="track-info">
                  <h3>{track.name}</h3>
                  <p>{track.artist}</p>
                  {track.match && (
                    <span className="match-score">
                      Match: {(track.match * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="track-actions">
                  {track.deezerUrl && (
                    <a
                      href={track.deezerUrl}
                      target="_blank"
                      rel="noopener noreferrer">
                      Open in Deezer
                    </a>
                  )}
                  <a href={track.url} target="_blank" rel="noopener noreferrer">
                    Listen on Last.fm
                  </a>
                  <button
                    onClick={() => handleGetSimilar(track.name, track.artist)}
                    className="similar-btn">
                    Find Similar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        onEnded={() => setPlayingTrack(null)}
        onPause={() => setPlayingTrack(null)}
      />
    </div>
  );
}

export default App;
