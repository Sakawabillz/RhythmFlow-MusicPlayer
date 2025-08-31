// src/components/SearchBar.jsx
import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  // Voice search logic
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setListening(false);
      onSearch(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex justify-center gap-2 mb-6"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for songs or artists..."
        className="px-4 py-2 rounded-lg w-64 text-black"
      />
      <button
        type="button"
        onClick={handleVoiceSearch}
        className={`px-3 py-2 rounded-lg ${listening ? 'bg-red-500' : 'bg-gray-700'} text-white hover:bg-blue-700 transition`}
        title="Voice search"
        aria-label="Voice search"
      >
        {listening ? '🎤...' : '🎤'}
      </button>
      <button
        type="submit"
        className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Search
      </button>
    </form>
  );
}
