export default function TrackCard({ track, onPlay }) {
  const cover = track?.album?.cover_medium || track?.album?.cover || '';
  const title = track?.title || 'Unknown title';
  const artist = track?.artist?.name || 'Unknown artist';

  return (
    <button
      onClick={() => onPlay(track)}
      className="text-left bg-white rounded-xl shadow hover:shadow-lg transition hover:-translate-y-0.5 overflow-hidden"
    >
      {cover && (
        <img src={cover} alt={title} className="w-full h-44 object-cover" />
      )}
      <div className="p-3">
        <h3 className="font-semibold truncate">{title}</h3>
        <p className="text-sm text-gray-500 truncate">{artist}</p>
      </div>
    </button>
  );
}
