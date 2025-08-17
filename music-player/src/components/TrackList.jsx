import TrackCard from './TrackCard';

export default function TrackList({ tracks, onPlay }) {
  if (!tracks?.length) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Try a search to see results.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {tracks.map((t) => (
        <TrackCard key={t.id} track={t} onPlay={onPlay} />
      ))}
    </div>
  );
}
