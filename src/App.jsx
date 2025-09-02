
import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import TrackCard from "./components/TrackCard";

// Simple Register form
function RegisterForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Registration successful! You can now log in.");
        setEmail(""); setPassword(""); setConfirm("");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="bg-black/50 p-8 rounded-xl shadow-lg max-w-md mx-auto mt-10 flex flex-col gap-4 border border-[#008000]/50">
      <h2 className="text-2xl font-bold mb-2 text-white">Register</h2>
      <input type="email" placeholder="Email" className="px-4 py-2 rounded bg-black/30 text-white border border-[#008000]/50 focus:border-[#008000] focus:outline-none" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" className="px-4 py-2 rounded bg-black/30 text-white border border-[#008000]/50 focus:border-[#008000] focus:outline-none" value={password} onChange={e => setPassword(e.target.value)} />
      <input type="password" placeholder="Confirm Password" className="px-4 py-2 rounded bg-black/30 text-white border border-[#008000]/50 focus:border-[#008000] focus:outline-none" value={confirm} onChange={e => setConfirm(e.target.value)} />
      {error && <div className="text-red-400 text-sm">{error}</div>}
      {success && <div className="text-green-400 text-sm">{success}</div>}
      <button type="submit" className="bg-[#008000] hover:bg-[#006400] text-white font-bold py-2 rounded transition">Register</button>
    </form>
  );
}

// Simple Login form
function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }
    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("jwt_token", data.token);
        setSuccess("Login successful! Token saved.");
        setEmail(""); setPassword("");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="bg-black/50 p-8 rounded-xl shadow-lg max-w-md mx-auto mt-10 flex flex-col gap-4 border border-[#008000]/50">
      <h2 className="text-2xl font-bold mb-2 text-white">Login</h2>
      <input type="email" placeholder="Email" className="px-4 py-2 rounded bg-black/30 text-white border border-[#008000]/50 focus:border-[#008000] focus:outline-none" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" className="px-4 py-2 rounded bg-black/30 text-white border border-[#008000]/50 focus:border-[#008000] focus:outline-none" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <div className="text-red-400 text-sm">{error}</div>}
      {success && <div className="text-green-400 text-sm">{success}</div>}
      <button type="submit" className="bg-[#008000] hover:bg-[#006400] text-white font-bold py-2 rounded transition">Login</button>
    </form>
  );
}

const TABS = ["Register", "Login", "Explore as Guest", "My Playlists"];

function Footer() {
  return (
    <footer className="mt-12 py-4 text-center text-white/80 bg-black/50 border-t border-[#008000]/30">
      &copy; {new Date().getFullYear()} Rhythm Flow. All rights reserved.
    </footer>
  );
}


export default function App() {
  const [activeTab, setActiveTab] = useState("Explore as Guest");
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [playlistStatus, setPlaylistStatus] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    // Persist dark mode in localStorage
    const stored = localStorage.getItem("dark_mode");
    return stored ? stored === "true" : true;
  });

  React.useEffect(() => {
    localStorage.setItem("dark_mode", darkMode);
  }, [darkMode]);

  // Check if user is logged in (JWT exists)
  const isLoggedIn = !!localStorage.getItem("jwt_token");

  // Only show My Playlists tab if logged in
  const visibleTabs = isLoggedIn ? TABS : TABS.filter(tab => tab !== "My Playlists");

  // Fetch playlists on login or when switching to My Playlists
  React.useEffect(() => {
    if (activeTab === "My Playlists" && isLoggedIn) {
      fetchPlaylists();
    }
    // eslint-disable-next-line
  }, [activeTab, isLoggedIn]);

  async function fetchPlaylists() {
    setPlaylistStatus("");
    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/playlists`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt_token")}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPlaylists(data.playlists || []);
      } else {
        setPlaylistStatus(data.error || "Failed to fetch playlists");
      }
    } catch (err) {
      setPlaylistStatus("Server error fetching playlists");
    }
  }

  async function savePlaylists(newPlaylists) {
    setPlaylistStatus("");
    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
        },
        body: JSON.stringify({ playlists: newPlaylists })
      });
      const data = await res.json();
      if (res.ok) {
        setPlaylists(newPlaylists);
        setPlaylistStatus("Playlists saved!");
      } else {
        setPlaylistStatus(data.error || "Failed to save playlists");
      }
    } catch (err) {
      setPlaylistStatus("Server error saving playlists");
    }
  }

  // Add a track to playlists (demo: just one playlist for now)
  function addToPlaylist(track) {
    const exists = playlists.some(t => t.id === track.id);
    if (!exists) {
      const updated = [...playlists, track];
      setPlaylists(updated);
      savePlaylists(updated);
    }
  }

  function removeFromPlaylist(trackId) {
    const updated = playlists.filter(t => t.id !== trackId);
    setPlaylists(updated);
    savePlaylists(updated);
  }

  const searchMusic = async (query) => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data && data.data) {
        setTracks(data.data);
      } else {
        setTracks([]);
      }
    } catch (error) {
      console.error("Error fetching music:", error);
      setTracks([]);
    }
  };

  return (
    <div className={(darkMode ? "dark " : "") + "min-h-screen bg-gradient-to-br from-[#008000] to-[#000000] text-white flex flex-col"}>
      <header className="mb-8 py-6 bg-gradient-to-r from-[#008000] to-[#000000] shadow-lg flex flex-col items-center">
        <div className="flex w-full justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-center text-white drop-shadow-lg">🎵 Rhythm Flow</h1>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="ml-4 px-4 py-2 rounded-full border border-white bg-[#008000] text-white hover:bg-[#006400] transition"
            title="Toggle dark mode"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          {visibleTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-semibold transition border-2 border-white/50 ${
                activeTab === tab
                  ? "bg-[#008000] text-white border-white shadow-lg"
                  : "bg-transparent text-white/80 hover:bg-[#008000]/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto">
        {activeTab === "Register" && <RegisterForm />}
        {activeTab === "Login" && <LoginForm />}

        {activeTab === "Explore as Guest" && (
          <>
            <section className="mb-10">
              <SearchBar onSearch={searchMusic} />
              <h2 className="text-xl font-bold text-green-300 mb-4 mt-8">Recently Added</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                {tracks.length > 0 ? (
                  tracks.map((track) => (
                    <TrackCard 
                      key={track.id} 
                      track={track} 
                      onAddToPlaylist={addToPlaylist}
                    />
                  ))
                ) : (
                  <p className="text-white/70 col-span-full text-center py-8">No tracks found. Try searching for music!</p>
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === "My Playlists" && isLoggedIn && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#008000] mb-4">My Playlist</h2>
            {playlistStatus && <div className="text-[#008000] mb-2">{playlistStatus}</div>}
            {playlists.length === 0 ? (
              <p className="text-gray-400">No tracks in your playlist yet.</p>
            ) : (
              <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
                {playlists.map((track) => (
                  <div key={track.id} className="relative">
                    <TrackCard track={track} />
                    <button
                      onClick={() => removeFromPlaylist(track.id)}
                      className="absolute top-2 right-2 bg-red-700 text-white px-2 py-1 rounded text-xs hover:bg-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
