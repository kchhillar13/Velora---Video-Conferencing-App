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
        'relative w-full h-full rounded-[2.5rem] overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl transition-all duration-500 group',
        isScreenSharing ? 'ring-2 ring-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.2)]' : 'hover:border-white/10'
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
            'w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]',
            isLocal && 'transform -scale-x-100'
          )}
        />
      ) : (
        /* Avatar fallback when camera is off */
        <div className="w-full h-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0%,transparent_70%)]" />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-zinc-900 border border-white/5 text-white text-3xl font-black shadow-2xl group-hover:scale-110 transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-20 rounded-full" />
            {initials}
          </div>
        </div>
      )}

      {/* Overlay — Name and status indicators */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="px-4 py-2 rounded-2xl bg-zinc-950/40 backdrop-blur-xl border border-white/5 flex items-center gap-2 shadow-2xl">
          <span className="text-xs font-bold text-white tracking-wide truncate max-w-[120px]">
            {userName}
            {isLocal && ' (You)'}
          </span>
          {!audioEnabled && (
            <div className="p-1 rounded-full bg-red-500/20">
              <MicOff className="size-3 text-red-500" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isScreenSharing && (
            <div className="p-2 rounded-2xl bg-blue-600/20 backdrop-blur-xl border border-blue-600/20 shadow-2xl">
              <Monitor className="size-4 text-blue-400" />
            </div>
          )}
          {!videoEnabled && (
            <div className="p-2 rounded-2xl bg-red-500/20 backdrop-blur-xl border border-red-500/20 shadow-2xl">
              <VideoOff className="size-4 text-red-400" />
            </div>
          )}
        </div>
      </div>

      {/* Local badge */}
      {isLocal && (
        <div className="absolute top-4 left-4 z-10">
          <div className="px-3 py-1 rounded-full bg-blue-600 text-[10px] font-black tracking-widest text-white shadow-2xl">
            LIVE
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTile;
