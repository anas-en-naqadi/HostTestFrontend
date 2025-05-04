"use client";
import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
// Import the ReactPlayer type explicitly
import type ReactPlayerType from "react-player";

// Dynamically import ReactPlayer with no SSR to avoid hydration errors
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });


interface VideoPlayerProps {
  url: string;
  width?: string;
  height?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
}
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  width = "100%",
  height = "auto",
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  onProgress,
  onDuration,
}) => {
  // Use the imported type for the ref
  const playerRef = useRef<ReactPlayerType>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playerReady, setPlayerReady] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    setIsPlaying(autoPlay);
  }, [autoPlay]);

  useEffect(() => {
    setPlayerReady(false);
  }, [url]);
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle progress updates from ReactPlayer
  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    setCurrentTime(state.playedSeconds);
    if (onProgress) {
      onProgress({
        played: state.played,
        playedSeconds: state.playedSeconds,
      });
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Always render the player but keep it hidden during loading */}
      <div className={playerReady ? "block" : "hidden"}>
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="auto"
          playing={isPlaying}
          controls={controls}
          loop={loop}
          muted={muted}
          onReady={() => setPlayerReady(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onProgress={handleProgress}
          progressInterval={200}
          onDuration={onDuration}
          config={{
            file: {
              attributes: {
                controlsList: "nodownload",
              },
            },
          }}
        />
      </div>
      
      {/* Show loading state while player is not ready */}
      {!playerReady && (
        <div
          style={{
            width: width,
            height: height === "auto" ? "100%" : height,
            aspectRatio: "16/9",
          }}
          className="bg-black flex items-center justify-center overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="animate-pulse w-12 h-12 rounded-full bg-gray-600 mb-4 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-white text-sm md:text-base font-medium">
              Loading Lesson...
            </div>
          </div>
        </div>
      )}
      
      {/* Your play/pause button (if !controls) */}
      {!controls && playerReady && (
        <button
          onClick={togglePlayPause}
          className="absolute bg-[#136A86] px-3 py-1 sm:px-4 sm:py-2 text-white text-xs sm:text-sm md:text-base rounded-lg sm:rounded-2xl m-2 sm:m-5 right-[25%]"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
