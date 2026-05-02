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
    <div className="w-full flex items-center justify-center gap-4 py-4 px-6 md:gap-6 md:py-6">
      <div className="flex items-center gap-3 bg-zinc-900/50 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/5 shadow-2xl">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleAudio}
          className={cn(
            'flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 hover:scale-110 active:scale-95',
            isAudioEnabled ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
          )}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? <Mic className="size-5 md:size-6" /> : <MicOff className="size-5 md:size-6" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleVideo}
          className={cn(
            'flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 hover:scale-110 active:scale-95',
            isVideoEnabled ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
          )}
          title={isVideoEnabled ? 'Stop Video' : 'Start Video'}
        >
          {isVideoEnabled ? <Video className="size-5 md:size-6" /> : <VideoOff className="size-5 md:size-6" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          className={cn(
            'flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 hover:scale-110 active:scale-95',
            isScreenSharing ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-zinc-800 hover:bg-zinc-700 text-white'
          )}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          {isScreenSharing ? (
            <MonitorOff className="size-5 md:size-6" />
          ) : (
            <Monitor className="size-5 md:size-6" />
          )}
        </button>

        {/* Participants Toggle */}
        <button
          onClick={onToggleParticipants}
          className={cn(
            'relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 hover:scale-110 active:scale-95',
            isParticipantListOpen ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'
          )}
          title="Participants"
        >
          <Users className="size-5 md:size-6" />
          {participantCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-black w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center ring-2 ring-zinc-900">
              {participantCount}
            </span>
          )}
        </button>
      </div>

      {/* Leave Call */}
      <button
        onClick={onLeave}
        className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.4)] group"
        title="Leave meeting"
      >
        <PhoneOff className="size-6 md:size-7 group-hover:rotate-[135deg] transition-transform duration-500" />
      </button>
    </div>
  );
};

export default MediaControls;
