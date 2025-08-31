// src/components/TrackCard.jsx
import React, { useState } from "react";

export default function TrackCard({ track }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [lyricsStatus, setLyricsStatus] = useState("");
  const audio = new Audio(track.preview); // 30s Deezer preview

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const fetchLyrics = async () => {
    setLyricsStatus("Loading lyrics...");
    setLyrics("");
    try {
      const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(track.artist.name)}/${encodeURIComponent(track.title)}`);
      const data = await res.json();
      if (data.lyrics) {
        setLyrics(data.lyrics);
        setLyricsStatus("");
      } else {
        setLyricsStatus("No lyrics found.");
      }
    } catch (err) {
      setLyricsStatus("Error fetching lyrics.");
    }
  };

  const handleLyricsClick = () => {
    if (!showLyrics) {
      fetchLyrics();
    }
    setShowLyrics(!showLyrics);
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col items-center w-full">
      <img
        src={track.album.cover_medium}
        alt={track.title}
        className="rounded-xl mb-3"
      />
      <h3 className="text-lg font-semibold">{track.title}</h3>
      <p className="text-gray-400">{track.artist.name}</p>

      <button
        onClick={togglePlay}
        className="mt-3 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
      >
        {isPlaying ? "⏸ Pause" : "▶️ Play"}
      </button>

      <button
        onClick={handleLyricsClick}
        className="mt-2 px-3 py-1 bg-blue-700 rounded hover:bg-blue-800 text-white text-xs"
      >
        {showLyrics ? "Hide Lyrics" : "Show Lyrics"}
      </button>

      {showLyrics && (
        <div className="mt-3 w-full max-h-48 overflow-y-auto bg-gray-900 bg-opacity-80 p-3 rounded text-sm text-green-200 whitespace-pre-line">
          {lyricsStatus ? lyricsStatus : lyrics}
        </div>
      )}
    </div>
  );
}
