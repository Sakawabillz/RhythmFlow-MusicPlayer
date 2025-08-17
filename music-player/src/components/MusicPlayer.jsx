import { useEffect, useRef, useState } from 'react';

export default function MusicPlayer({ track }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const src = track?.preview || '';

  useEffect(() => {
    // Auto-play when a new track is selected
    if (audioRef.current && src) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [src]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const title = track?.title || 'No track selected';
  const artist = track?.artist?.name || '';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white">
      <div className="container-px py-3 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{title}</div>
          <div className="text-sm text-gray-300 truncate">{artist}</div>
        </div>

        <button
          onClick={toggle}
          className="rounded-md bg-white/10 px-4 py-2 hover:bg-white/20 transition"
          disabled={!src}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <audio ref={audioRef} preload="none">
          {src && <source src={src} type="audio/mpeg" />}
        </audio>
      </div>
    </div>
  );
}
