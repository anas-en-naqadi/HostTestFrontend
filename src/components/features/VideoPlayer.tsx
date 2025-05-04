// components/VideoPlayer.tsx
"use client";

import React from "react";
import ReactPlayer from "react-player";
import { useState } from "react";
interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="relative w-full rounded-lg h-[341px]  overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {!isReady && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        className="absolute inset-0"
        onReady={() => setIsReady(true)}
        onError={() => setHasError(true)}
        config={{
          file: {
            attributes: {
              controlsList: "nodownload",
              style: {
                objectFit: "cover",
                width: "100%",
                height: "100%",
              },
            },
          },
        }}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600">
          Failed to load video
        </div>
      )}
    </div>
  );
}
