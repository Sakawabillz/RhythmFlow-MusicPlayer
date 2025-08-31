import React, { useRef, useState } from "react";
import { AudioVisualizer } from "react-audio-visualize";


const DEMO_AUDIO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const MusicPlayer = () => {
	const audioRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const togglePlay = () => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
		setIsPlaying(!isPlaying);
	};

	return (
		<div className="p-4 bg-gray-800 text-white rounded shadow-md w-full max-w-md mx-auto flex flex-col items-center">
			<h2 className="text-xl font-bold mb-4">Music Player</h2>
			<audio ref={audioRef} src={DEMO_AUDIO} />
			<AudioVisualizer
				audio={audioRef}
				width={320}
				height={60}
				barColor="#22c55e"
				backgroundColor="#1e293b"
				gap={2}
			/>
			<div className="flex items-center justify-between w-full mt-4">
				<button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">Prev</button>
				<button
					className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
					onClick={togglePlay}
				>
					{isPlaying ? "Pause" : "Play"}
				</button>
				<button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">Next</button>
			</div>
		</div>
	);
};

export default MusicPlayer;
