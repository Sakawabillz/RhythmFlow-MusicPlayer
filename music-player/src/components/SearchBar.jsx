import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();
    onSearch(q);
  };

  return (
    <form onSubmit={submit} className="flex gap-2 w-full max-w-2xl mx-auto">
      <input
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search songs, artists, or albums…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button
        type="submit"
        className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition"
      >
        Search
      </button>
    </form>
  );
}
