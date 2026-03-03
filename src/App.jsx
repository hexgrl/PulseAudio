import React, { useState, useRef } from "react";
import "./Pulse.css";
import { useMusicSearch } from "./useMusicSearch";

function App() {
  const {
    tracks,
    currentTag,
    loading,
    error,
    handleSearch,
    handleRefresh,
    handleGetSimilar,
  } = useMusicSearch();
  const [mood, setMood] = useState("");
  const [playingTrack, setPlayingTrack] = useState(null);
  const audioRef = useRef(null);

  const handlePlayPreview = (track) => {
    if (!track.previewUrl) return;

    if (playingTrack === track.name) {
      audioRef.current.pause();
      setPlayingTrack(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.previewUrl;
        audioRef.current.play().catch(() => setPlayingTrack(null));
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
          onKeyDown={(e) => e.key === "Enter" && handleSearch(mood)}
        />
        <button onClick={() => handleSearch(mood)} disabled={loading}>
          {loading ? "Searching..." : "Find Music"}
        </button>
        {tracks.length > 0 && (
          <button
            onClick={() => handleRefresh(mood)}
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
            {tracks.map((track) => (
              <div key={track.url} className="track-item">
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
                      }
                    />
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

      <audio ref={audioRef} onEnded={() => setPlayingTrack(null)} />
    </div>
  );
}

export default App;
