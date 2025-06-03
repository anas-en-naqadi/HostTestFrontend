"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
// Import CSS directly from node_modules
import "plyr/dist/plyr.css";
import { Loader2 } from "lucide-react";

// Declare YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  url?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  Boxheight?: string;
  muted?: boolean;
  isWhat?: string;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  isWhat = "lesson",
  Boxheight = "100%",
  onProgress,
  onDuration,
}) => {
  // Use a more generic ref type since we'll use it for both video and iframe
  const videoRef = useRef<HTMLVideoElement | HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playerReady, setPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);

  // Store callbacks in refs to avoid dependency changes triggering effect reruns
  const onProgressRef = useRef(onProgress);
  const onDurationRef = useRef(onDuration);

  // Update refs when props change
  useEffect(() => {
    onProgressRef.current = onProgress;
    onDurationRef.current = onDuration;
  }, [onProgress, onDuration]);

  // Update playing state when autoPlay prop changes
  useEffect(() => {
    setIsPlaying(autoPlay);
  }, [autoPlay]);

  // Reset player ready state and error state when URL changes
  useEffect(() => {
    setPlayerReady(false);
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);
  }, [url]);

  // Toggle play/pause function
  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Create a stable timeUpdate handler using useCallback
  const handleTimeUpdate = useCallback(() => {
    const player = playerRef.current;
    if (!player || typeof player.currentTime !== 'number' || !player.duration) return;

    const currentTime = player.currentTime;
    const duration = player.duration || 1; // Prevent division by zero

    setCurrentTime(currentTime);

    // Use the ref to get the latest callback
    if (onProgressRef.current) {
      onProgressRef.current({
        played: currentTime / duration,
        playedSeconds: currentTime,
      });
    }
  }, []);

  // Create a stable duration handler
  const handleDuration = useCallback((duration: number) => {
    if (duration > 0) {
      setDuration(duration);
      if (onDurationRef.current) {
        onDurationRef.current(duration);
      }
    }
  }, []);

  // --- YouTube Logic Optimized ---
  // Only load and initialize YouTube API/player if needed
  useEffect(() => {
    if (typeof window === "undefined" || !isYoutubeVideo(url) || !url) return;
    let player: any = null;
    let interval: NodeJS.Timeout | null = null;
    // Only load API if not present
    function loadYouTubeAPI(cb: () => void) {
      if (window.YT && window.YT.Player) {
        cb();
      } else {
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          cb();
        };
        if (!document.getElementById('youtube-iframe-api')) {
          const tag = document.createElement('script');
          tag.id = 'youtube-iframe-api';
          tag.src = 'https://www.youtube.com/iframe_api';
          document.body.appendChild(tag);
        }
      }
    }
    function cleanup() {
      if (player) {
        player.destroy();
        player = null;
      }
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      playerRef.current = null;
    }
    function initPlayer() {
      if (!videoRef.current) return;
      cleanup();
      const videoId = getYoutubeVideoId(url);
      
      player = new window.YT.Player(videoRef.current, {
        videoId: videoId || '',
        playerVars: {
          autoplay: autoPlay ? 1 : 0,
          controls: controls ? 1 : 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          loop: loop ? 1 : 0,
          mute: muted ? 1 : 0,
          playsinline: 1,
          iv_load_policy: 3
        },
        events: {
          onReady: (event: any) => {
            setIsLoading(false);
            setPlayerReady(true);
            
            // Use multiple strategies to get duration ASAP
            const strategies = [
              () => event.target.getDuration(),
              () => event.target.getVideoData()?.length_seconds,
              () => {
                // Force metadata load by seeking to 0
                event.target.seekTo(0, true);
                return event.target.getDuration();
              }
            ];
            
            const tryGetDuration = (strategyIndex = 0) => {
              if (strategyIndex >= strategies.length) return;
              
              try {
                const duration = strategies[strategyIndex]();
                if (duration && duration > 0) {
                  setDuration(duration);
                  if (onDurationRef.current) {
                    onDurationRef.current(duration);
                  }
                  return;
                }
              } catch (e) {
                console.warn(`Duration strategy ${strategyIndex} failed:`, e);
              }
              
              // Try next strategy after a short delay
              setTimeout(() => tryGetDuration(strategyIndex + 1), 50);
            };
            
            tryGetDuration();
            
            // Set up progress tracking with higher frequency
            interval = setInterval(() => {
              try {
                if (!player) return;
                
                const currentTime = player.getCurrentTime();
                const currentDuration = player.getDuration();
                
                setCurrentTime(currentTime);
                
                // Report progress immediately when we have both values
                if (currentDuration && currentDuration > 0 && onProgressRef.current) {
                  onProgressRef.current({ 
                    played: currentTime / currentDuration, 
                    playedSeconds: currentTime 
                  });
                }
                
                // Update duration if changed
                if (currentDuration && currentDuration > 0 && Math.abs(currentDuration - duration) > 0.1) {
                  setDuration(currentDuration);
                  if (onDurationRef.current) {
                    onDurationRef.current(currentDuration);
                  }
                }
              } catch (error) {
                console.warn('Error in progress tracking:', error);
              }
            }, 250); // Update every 250ms for smoother progress
          },
          
          onStateChange: (event: any) => {
            // Check duration whenever state changes
            if (event.data === window.YT.PlayerState.BUFFERING || 
                event.data === window.YT.PlayerState.PLAYING) {
              const currentDuration = player?.getDuration();
              if (currentDuration && currentDuration > 0 && currentDuration !== duration) {
                setDuration(currentDuration);
                if (onDurationRef.current) {
                  onDurationRef.current(currentDuration);
                }
              }
            }
            
            // Handle other state changes
            switch(event.data) {
              case window.YT.PlayerState.PLAYING:
                setIsPlaying(true); 
                setVideoEnded(false); 
                break;
              case window.YT.PlayerState.PAUSED:
                setIsPlaying(false); 
                break;
              case window.YT.PlayerState.ENDED:
                setIsPlaying(false); 
                setVideoEnded(true);
                if (onProgressRef.current && player) {
                  const finalDuration = player.getDuration();
                  onProgressRef.current({ played: 1, playedSeconds: finalDuration });
                }
                break;
            }
          },
          
          onError: () => {
            setHasError(true);
            setIsLoading(false);
            setErrorMessage('YouTube video failed to load. Please check your connection or try a different video.');
          }
        }
      });
      
      playerRef.current = player;
    }
    loadYouTubeAPI(initPlayer);
    return cleanup;
  }, [url, autoPlay, controls, muted, loop]);
  // --- End YouTube Logic ---


  // Initialize Plyr when the component mounts or URL changes
  useEffect(() => {
    // Make sure we're on the client side and have a valid URL
    if (typeof window === "undefined" || !videoRef.current || !url || url.trim() === '') {
      setIsLoading(false);
      return;
    }
    
    // Skip Plyr initialization for YouTube videos as they use iframe embed
    if (isYoutubeVideo(url)) {
      return; // YouTube handling is done in the separate effect
    }

    let player: any = null;

    // Clean up function
    const cleanup = () => {
      if (player) {
        // Properly remove event listeners
        player.off('timeupdate', handleTimeUpdate);
        player.destroy();
      }

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };

    // Use a dynamic import to avoid SSR issues
    const initPlayer = async () => {
      try {
        // Clean up previous instance if it exists
        cleanup();

        // Import Plyr
        const PlyrModule = await import('plyr');
        const Plyr = PlyrModule.default;

        // Create new Plyr instance with proper options
        player = new Plyr(videoRef.current!, {
          debug: false,
          controls: controls ? [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            Boxheight === "100%" ? 'fullscreen' : ''
          ] : [],
          settings: ['captions', 'quality', 'speed'],
          loadSprite: true,
          iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
          blankVideo: 'https://cdn.plyr.io/static/blank.mp4',
          autoplay: autoPlay,
          autopause: true,
          seekTime: 10,
          volume: 1,
          muted: muted,
          clickToPlay: true,
          disableContextMenu: false,
          hideControls: false,
          resetOnEnd: false,
          keyboard: { focused: true, global: false },
          tooltips: { controls: true, seek: true },
          duration: undefined,
          displayDuration: true,
          invertTime: true,
          toggleInvert: true,
          captions: { active: false, language: 'auto' },
          fullscreen: { enabled: true, fallback: true, iosNative: false },
          storage: { enabled: true, key: 'plyr' },
          speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5] },
          quality: { default: 576, options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240] },
          loop: { active: loop },
          i18n: {
            restart: 'Restart',
            rewind: 'Rewind {seektime}s',
            play: 'Play',
            pause: 'Pause',
            fastForward: 'Forward {seektime}s',
            seek: 'Seek',
            seekLabel: '{currentTime} of {duration}',
            played: 'Played',
            buffered: 'Buffered',
            currentTime: 'Current time',
            duration: 'Duration',
            volume: 'Volume',
            mute: 'Mute',
            unmute: 'Unmute',
            enableCaptions: 'Enable captions',
            disableCaptions: 'Disable captions',
            download: 'Download',
            enterFullscreen: 'Enter fullscreen',
            exitFullscreen: 'Exit fullscreen',
            frameTitle: 'Player for {title}',
            captions: 'Captions',
            settings: 'Settings',
            menuBack: 'Go back to previous menu',
            speed: 'Speed',
            normal: 'Normal',
            quality: 'Quality',
            loop: 'Loop',
          },
        });

        // Store player reference
        playerRef.current = player;

        // Set up event listeners
        player.on('ready', () => {
          console.log('Plyr is ready');
          setIsLoading(false);
          setPlayerReady(true);

          // Try to get duration as soon as possible
          if (player.duration) {
            handleDuration(player.duration);
          }
        });

        player.on('loadeddata', () => {
          console.log('Video data loaded');
          setIsLoading(false);
          setPlayerReady(true);

          // Another opportunity to get the duration
          if (player.duration) {
            handleDuration(player.duration);
          }
        });

        player.on('loadedmetadata', () => {
          console.log('Video metadata loaded');

          // Most reliable place to get duration
          if (player.duration) {
            handleDuration(player.duration);
          }
        });

        player.on('durationchange', () => {
          if (player.duration) {
            console.log('Duration changed:', player.duration);
            handleDuration(player.duration);
          }
        });

        player.on('play', () => {
          setIsPlaying(true);
          setVideoEnded(false);
        });

        player.on('pause', () => {
          setIsPlaying(false);
        });

        player.on('ended', () => {
          setIsPlaying(false);
          setVideoEnded(true);

          // Final progress update to ensure 100% completion is reported
          if (onProgressRef.current && player.duration) {
            onProgressRef.current({
              played: 1,
              playedSeconds: player.duration,
            });
          }
        });

        player.on('error', (error: any) => {
          console.error('Plyr error:', error);
          setHasError(true);
          setIsLoading(false);
          setErrorMessage("Failed to load video. Please check your connection or try a different video.");
        });

        // Set up timeupdate for progress tracking - this is the key event handler
        player.on('timeupdate', handleTimeUpdate);

        // Force loading to complete after a timeout
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);

      } catch (error) {
        console.error('Error initializing Plyr:', error);
        setHasError(true);
        setIsLoading(false);
        setErrorMessage("An unexpected error occurred while initializing the video player.");
      }
    };

    // Initialize the player
    initPlayer();

    // Clean up on unmount or URL change
    return cleanup;
  }, [url, controls, autoPlay, muted, loop, handleTimeUpdate, handleDuration]);

  // Determine video type from URL (with null/undefined check)
  const getVideoType = (videoUrl?: string) => {
    if (!videoUrl) return 'video/mp4';
    if (videoUrl.includes('pexels.com')) return 'video/mp4';
    if (videoUrl.includes('.mp4')) return 'video/mp4';
    if (videoUrl.includes('.webm')) return 'video/webm';
    if (videoUrl.includes('.ogg')) return 'video/ogg';
    if (videoUrl.includes('.m3u8')) return 'application/x-mpegURL';
    return 'video/mp4';
  };
  
  // Check if the URL is a YouTube video
  const isYoutubeVideo = (videoUrl?: string) => {
    if (!videoUrl) return false;
    return (
      videoUrl.includes('youtube.com') || 
      videoUrl.includes('youtu.be') ||
      videoUrl.includes('youtube-nocookie.com')
    );
  };
  
  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (videoUrl?: string) => {
    if (!videoUrl) return '';
    
    // Handle different YouTube URL formats
    let match;
    
    // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
    match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (match && match[1]) return match[1];
    
    // YouTube Embed URL: https://www.youtube.com/embed/VIDEO_ID
    match = videoUrl.match(/youtube\.com\/embed\/([^&\s]+)/);
    if (match && match[1]) return match[1];
    
    // YouTube Short URL: https://youtu.be/VIDEO_ID
    match = videoUrl.match(/youtu\.be\/([^&\s]+)/);
    if (match && match[1]) return match[1];
    
    return '';
  };

  // If no URL is provided or it's an empty string, show a placeholder
  if (!url || url.trim() === '') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500 font-medium">No video available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Only show player when ready and no error */}
      <div className={playerReady && !hasError ? "block" : "hidden"} style={{ width: '100%', position: 'relative', height: Boxheight }}>
        {isYoutubeVideo(url) ? (
          // YouTube video embed
          <div className="plyr__video-embed" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <div
              id="youtube-player"
              ref={videoRef as React.RefObject<HTMLDivElement>}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: hasError ? "none" : "block",
              }}
            ></div>
          </div>
        ) : (
          // Regular video embed
          <div className="plyr__video-embed" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <video
              ref={videoRef as React.RefObject<HTMLVideoElement>}
              className="w-full h-full"
              playsInline
              controls
              crossOrigin="anonymous"
              preload="metadata"
              style={{
                width: '100%',
                height: Boxheight,
                objectFit: 'contain',
                display: hasError ? "none" : "block",
                '--plyr-color-main': '#136A86',
              } as React.CSSProperties}
              onError={e => {
                setHasError(true);
                setErrorMessage("Video failed to load. The file may be missing, corrupted, or in an unsupported format.");
              }}
            >
              {url && url.trim() !== '' && (
                <source src={url} type={getVideoType(url)} />
              )}
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
      {/* Loading state - improved with animation */}
      {(isLoading || !playerReady) && !hasError && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
          <span className="text-white mt-2">Loading {isWhat === "intro" ? "intro" : "lesson"}...</span>
        </div>
      </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div style={{ height: Boxheight }} className={`absolute inset-0 flex items-center justify-center bg-red-100 border-2 border-red-500 rounded-lg text-red-700 font-semibold text-center p-6 z-20`}>
          {errorMessage || "An unknown error occurred while loading the video."}
        </div>
      )}
      
      {/* Custom play/pause button when controls are disabled */}
      {!controls && playerReady && !videoEnded && (
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