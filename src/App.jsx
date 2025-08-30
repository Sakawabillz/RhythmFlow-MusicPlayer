import { useState } from 'react';
import SearchBar from './components/SearchBar';
import TrackList from './components/TrackList';
import MusicPlayer from './components/MusicPlayer';
import { searchTracks } from './services/deezer';

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onSearch = async (q) => {
    try {
      setErr('');
      setLoading(true);
      const list = await searchTracks(q);
      setTracks(list);
      if (!list.length) setCurrent(null);
    } catch (e) {
      setErr('Something went wrong while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onPlay = (track) => setCurrent(track);

  return (
    <div className="min-h-screen pb-24">
      <header className="container-px py-8">
        <h1 className="text-2xl sm:text-3xl font-bold">🎵 Music Player</h1>
        <p className="text-gray-600 mt-1">
          Search tracks via Deezer and play 30-sec previews.
        </p>
      </header>

      <main className="container-px">
        <SearchBar onSearch={onSearch} />
        {loading && <div className="mt-6 text-gray-500">Loading…</div>}
        {err && <div className="mt-6 text-red-600">{err}</div>}
        {!loading && !err && <TrackList tracks={tracks} onPlay={onPlay} />}
      </main>

      <MusicPlayer track={current} />
    </div>
  );
}
