'use client';

import { useRef, useEffect } from 'react';
import { MicOff, VideoOff, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoTileProps {
  stream: MediaStream | null;
  userName: string;
  isLocal?: boolean;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
}

const VideoTile = ({
  stream,
  userName,
  isLocal = false,
  audioEnabled = true,
  videoEnabled = true,
  isScreenSharing = false,
}: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'relative w-full h-full rounded-3xl overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl transition-all',
        isScreenSharing ? 'ring-2 ring-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]' : 'hover:border-white/20'
      )}
    >
      {/* Video Element */}
      {stream && videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            'w-full h-full object-cover',
            isLocal && 'transform -scale-x-100'
          )}
        />
      ) : (
        /* Avatar fallback when camera is off */
        <div className="w-full h-full flex items-center justify-center bg-zinc-950">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-3xl font-bold shadow-[0_0_30px_rgba(37,99,235,0.3)]">
            {initials}
          </div>
        </div>
      )}

      {/* Overlay — Name and status indicators */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white drop-shadow-md truncate max-w-[150px]">
              {userName}
              {isLocal && ' (You)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isScreenSharing && (
              <div className="p-1.5 rounded-lg bg-blue-600/30 backdrop-blur-md border border-blue-500/30">
                <Monitor className="size-3.5 text-blue-300" />
              </div>
            )}
            {!audioEnabled && (
              <div className="p-1.5 rounded-lg bg-red-500/30 backdrop-blur-md border border-red-500/30">
                <MicOff className="size-3.5 text-red-300" />
              </div>
            )}
            {!videoEnabled && (
              <div className="p-1.5 rounded-lg bg-red-500/30 backdrop-blur-md border border-red-500/30">
                <VideoOff className="size-3.5 text-red-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Local badge */}
      {isLocal && (
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-[10px] font-medium bg-blue-1/80 text-white rounded-md backdrop-blur-sm">
            YOU
          </span>
        </div>
      )}
    </div>
  );
};

export default VideoTile;
