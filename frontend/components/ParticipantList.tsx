'use client';

import { X, Mic, MicOff, Video, VideoOff, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type PeerState } from '@/store/meeting.store';

interface ParticipantListProps {
  isOpen: boolean;
  onClose: () => void;
  localUserName: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  peers: Map<string, PeerState>;
}

const ParticipantList = ({
  isOpen,
  onClose,
  localUserName,
  isAudioEnabled,
  isVideoEnabled,
  peers,
}: ParticipantListProps) => {
  if (!isOpen) return null;

  const totalCount = peers.size + 1; // +1 for local user

  return (
    <div className="absolute right-0 top-0 h-full w-[340px] bg-zinc-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl animate-slide-in z-30 flex flex-col">
      {/* Header */}
      <div className="flex-between p-4 border-b border-white/5">
        <h3 className="text-base font-semibold text-white">
          Participants ({totalCount})
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-105 active:scale-95"
          aria-label="Close participant list"
        >
          <X className="size-4 text-zinc-400 hover:text-white" />
        </button>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Local User (You) */}
        <ParticipantItem
          name={`${localUserName} (You)`}
          audioEnabled={isAudioEnabled}
          videoEnabled={isVideoEnabled}
          isScreenSharing={false}
          isHost
        />

        {/* Remote Peers */}
        {Array.from(peers.entries()).map(([socketId, peer]) => (
          <ParticipantItem
            key={socketId}
            name={peer.userName}
            audioEnabled={peer.audioEnabled}
            videoEnabled={peer.videoEnabled}
            isScreenSharing={peer.isScreenSharing}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Participant Item ──────────────────────────────────

interface ParticipantItemProps {
  name: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
  isHost?: boolean;
}

const ParticipantItem = ({
  name,
  audioEnabled,
  videoEnabled,
  isScreenSharing,
  isHost = false,
}: ParticipantItemProps) => {
  const initials = name
    .replace(' (You)', '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-default">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold shadow-lg shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {isHost && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-1/20 text-blue-1 font-medium">
              HOST
            </span>
          )}
          {isScreenSharing && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-1/20 text-green-1 font-medium flex items-center gap-0.5">
              <Monitor className="size-2.5" /> Sharing
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            'p-1 rounded',
            audioEnabled ? 'text-gray-400' : 'bg-red-500/20 text-red-400'
          )}
        >
          {audioEnabled ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
        </div>
        <div
          className={cn(
            'p-1 rounded',
            videoEnabled ? 'text-gray-400' : 'bg-red-500/20 text-red-400'
          )}
        >
          {videoEnabled ? <Video className="size-3.5" /> : <VideoOff className="size-3.5" />}
        </div>
      </div>
    </div>
  );
};

export default ParticipantList;
