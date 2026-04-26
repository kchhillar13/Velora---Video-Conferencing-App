'use client';

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Users,
  PhoneOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isParticipantListOpen: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleParticipants: () => void;
  onLeave: () => void;
  participantCount: number;
}

const MediaControls = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isParticipantListOpen,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleParticipants,
  onLeave,
  participantCount,
}: MediaControlsProps) => {
  return (
    <div className="w-full flex items-center justify-center gap-6 p-6">
      {/* Microphone Toggle */}
      <button
        onClick={onToggleAudio}
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg',
          isAudioEnabled ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
        )}
        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioEnabled ? <Mic className="size-6" /> : <MicOff className="size-6" />}
      </button>

      {/* Camera Toggle */}
      <button
        onClick={onToggleVideo}
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg',
          isVideoEnabled ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
        )}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? <Video className="size-6" /> : <VideoOff className="size-6" />}
      </button>

      {/* Screen Share Toggle */}
      <button
        onClick={onToggleScreenShare}
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg',
          isScreenSharing ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-zinc-800 hover:bg-zinc-700 text-white'
        )}
        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        {isScreenSharing ? (
          <MonitorOff className="size-6" />
        ) : (
          <Monitor className="size-6" />
        )}
      </button>

      {/* Participants Toggle */}
      <button
        onClick={onToggleParticipants}
        className={cn(
          'relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg',
          isParticipantListOpen ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-zinc-800 hover:bg-zinc-700 text-white'
        )}
        title="Participants"
      >
        <Users className="size-6" />
        {participantCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-zinc-950">
            {participantCount}
          </span>
        )}
      </button>

      {/* Leave Call */}
      <button
        onClick={onLeave}
        className="flex items-center justify-center w-16 h-16 rounded-3xl bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.4)] ml-4"
        title="Leave meeting"
      >
        <PhoneOff className="size-7" />
      </button>
    </div>
  );
};

export default MediaControls;
