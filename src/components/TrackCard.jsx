// src/components/TrackCard.jsx

import React, { useState } from "react";

export default function TrackCard({ track }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [lyricsStatus, setLyricsStatus] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState(null);
  const [detailsStatus, setDetailsStatus] = useState("");
  const [showAlbum, setShowAlbum] = useState(false);
  const [album, setAlbum] = useState(null);
  const [albumStatus, setAlbumStatus] = useState("");
  // Fetch album details from backend proxy
  const handleAlbumClick = async () => {
    if (!showAlbum) {
      setAlbumStatus("Loading album details...");
      setAlbum(null);
      try {
        const albumId = details?.album?.id || track.album.id;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/album/${albumId}`);
        const data = await res.json();
        if (res.ok && data && data.id) {
          setAlbum(data);
          setAlbumStatus("");
        } else {
          setAlbumStatus("No album details found.");
        }
      } catch (err) {
        setAlbumStatus("Error fetching album details.");
      }
    }
    setShowAlbum(!showAlbum);
  };
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

  // Fetch track details from backend proxy
  const handleDetailsClick = async () => {
    if (!showDetails) {
      setDetailsStatus("Loading details...");
      setDetails(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/track/${track.id}`);
        const data = await res.json();
        if (res.ok && data && data.id) {
          setDetails(data);
          setDetailsStatus("");
        } else {
          setDetailsStatus("No details found.");
        }
      } catch (err) {
        setDetailsStatus("Error fetching details.");
      }
    }
    setShowDetails(!showDetails);
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col items-center w-full">
      <img
        src={track.album.cover_medium}
        alt={track.title}
        className="rounded-xl mb-3 cursor-pointer"
        onClick={handleDetailsClick}
        title="Click for details"
      />
      <h3 className="text-lg font-semibold cursor-pointer" onClick={handleDetailsClick} title="Click for details">{track.title}</h3>
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

      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-2 right-2 text-white bg-red-600 rounded-full px-3 py-1 text-sm hover:bg-red-800"
            >
              Close
            </button>
            {detailsStatus && <div className="text-green-300 mb-2">{detailsStatus}</div>}
            {details && (
              <>
                <img src={details.album?.cover_big || details.album?.cover_medium} alt={details.title} className="rounded-xl mb-4 mx-auto" />
                <h2 className="text-2xl font-bold mb-2 text-green-300">{details.title}</h2>
                <p className="mb-1"><span className="font-semibold">Artist:</span> {details.artist?.name}</p>
                <p className="mb-1"><span className="font-semibold">Album:</span> {details.album?.title}</p>
                <p className="mb-1"><span className="font-semibold">Duration:</span> {Math.floor(details.duration/60)}:{(details.duration%60).toString().padStart(2,'0')} min</p>
                <p className="mb-1"><span className="font-semibold">Rank:</span> {details.rank}</p>
                <a href={details.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">View on Deezer</a>
                <button
                  onClick={handleAlbumClick}
                  className="block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 transition"
                >
                  {showAlbum ? "Hide Album Details" : "Show Album Details"}
                </button>
                {showAlbum && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-xl">
                    {albumStatus && <div className="text-green-300 mb-2">{albumStatus}</div>}
                    {album && (
                      <>
                        <img src={album.cover_big || album.cover_medium} alt={album.title} className="rounded-xl mb-2 mx-auto" />
                        <h3 className="text-xl font-bold mb-1 text-green-200">{album.title}</h3>
                        <p className="mb-1"><span className="font-semibold">Artist:</span> {album.artist?.name}</p>
                        <p className="mb-1"><span className="font-semibold">Release Date:</span> {album.release_date}</p>
                        <p className="mb-1"><span className="font-semibold">Tracks:</span> {album.nb_tracks}</p>
                        <p className="mb-1"><span className="font-semibold">Fans:</span> {album.fans}</p>
                        <a href={album.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">View Album on Deezer</a>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
