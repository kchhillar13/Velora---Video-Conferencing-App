import { create } from 'zustand';
import { type MeetingResponse } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────

export interface PeerState {
  stream: MediaStream;
  userName: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
}

interface MeetingState {
  // Local media
  localStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;

  // Meeting info
  meetingCode: string | null;
  isInMeeting: boolean;
  isSetupComplete: boolean;

  // Remote peers (keyed by socketId)
  peers: Map<string, PeerState>;

  // UI state
  isParticipantListOpen: boolean;
  isChatOpen: boolean;

  // Dashboard meetings list
  meetings: MeetingResponse[];
  meetingsLoading: boolean;

  // Actions — Local Media
  setLocalStream: (stream: MediaStream | null) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setScreenSharing: (sharing: boolean) => void;

  // Actions — Meeting
  setMeetingCode: (code: string | null) => void;
  setIsInMeeting: (inMeeting: boolean) => void;
  setIsSetupComplete: (complete: boolean) => void;

  // Actions — Peers
  addPeer: (socketId: string, stream: MediaStream, userName: string) => void;
  removePeer: (socketId: string) => void;
  updatePeerAudio: (socketId: string, enabled: boolean) => void;
  updatePeerVideo: (socketId: string, enabled: boolean) => void;
  updatePeerScreenShare: (socketId: string, isSharing: boolean) => void;
  updatePeerStream: (socketId: string, stream: MediaStream) => void;

  // Actions — Dashboard Meetings
  setMeetings: (meetings: MeetingResponse[]) => void;
  setMeetingsLoading: (loading: boolean) => void;
  updateMeetingInList: (meetingId: string, updates: Partial<MeetingResponse>) => void;
  removeMeetingFromList: (meetingId: string) => void;

  // Actions — UI
  toggleParticipantList: () => void;
  toggleChat: () => void;

  // Actions — Reset
  resetMeeting: () => void;
}

// ─── Store ──────────────────────────────────────────────

export const useMeetingStore = create<MeetingState>((set, get) => ({
  // Initial state
  localStream: null,
  isAudioEnabled: true,
  isVideoEnabled: true,
  isScreenSharing: false,
  meetingCode: null,
  isInMeeting: false,
  isSetupComplete: false,
  peers: new Map(),
  isParticipantListOpen: false,
  isChatOpen: false,
  meetings: [],
  meetingsLoading: false,

  // Local media actions
  setLocalStream: (stream) => set({ localStream: stream }),

  setAudioEnabled: (enabled) => {
    const { localStream } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
    set({ isAudioEnabled: enabled });
  },

  setVideoEnabled: (enabled) => {
    const { localStream } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
    set({ isVideoEnabled: enabled });
  },

  setScreenSharing: (sharing) => set({ isScreenSharing: sharing }),

  // Meeting actions
  setMeetingCode: (code) => set({ meetingCode: code }),
  setIsInMeeting: (inMeeting) => set({ isInMeeting: inMeeting }),
  setIsSetupComplete: (complete) => set({ isSetupComplete: complete }),

  // Peer actions
  addPeer: (socketId, stream, userName) => {
    set((state) => {
      const newPeers = new Map(state.peers);
      newPeers.set(socketId, {
        stream,
        userName,
        audioEnabled: true,
        videoEnabled: true,
        isScreenSharing: false,
      });
      return { peers: newPeers };
    });
  },

  removePeer: (socketId) => {
    set((state) => {
      const newPeers = new Map(state.peers);
      const peer = newPeers.get(socketId);
      if (peer) {
        // Stop all tracks on the peer's stream
        peer.stream.getTracks().forEach((track) => track.stop());
      }
      newPeers.delete(socketId);
      return { peers: newPeers };
    });
  },

  updatePeerAudio: (socketId, enabled) => {
    set((state) => {
      const newPeers = new Map(state.peers);
      const peer = newPeers.get(socketId);
      if (peer) {
        newPeers.set(socketId, { ...peer, audioEnabled: enabled });
      }
      return { peers: newPeers };
    });
  },

  updatePeerVideo: (socketId, enabled) => {
    set((state) => {
      const newPeers = new Map(state.peers);
      const peer = newPeers.get(socketId);
      if (peer) {
        newPeers.set(socketId, { ...peer, videoEnabled: enabled });
      }
      return { peers: newPeers };
    });
  },

  updatePeerScreenShare: (socketId, isSharing) => {
    set((state) => {
      const newPeers = new Map(state.peers);
      const peer = newPeers.get(socketId);
      if (peer) {
        newPeers.set(socketId, { ...peer, isScreenSharing: isSharing });
      }
      return { peers: newPeers };
    });
  },

  updatePeerStream: (socketId, stream) => {
    set((state) => {
      const newPeers = new Map(state.peers);
      const peer = newPeers.get(socketId);
      if (peer) {
        newPeers.set(socketId, { ...peer, stream });
      }
      return { peers: newPeers };
    });
  },

  // Dashboard meetings actions
  setMeetings: (meetings) => set({ meetings }),
  setMeetingsLoading: (loading) => set({ meetingsLoading: loading }),

  updateMeetingInList: (meetingId, updates) => {
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === meetingId ? { ...m, ...updates } : m
      ),
    }));
  },

  removeMeetingFromList: (meetingId) => {
    set((state) => ({
      meetings: state.meetings.filter((m) => m.id !== meetingId),
    }));
  },

  // UI actions
  toggleParticipantList: () =>
    set((state) => ({ isParticipantListOpen: !state.isParticipantListOpen })),
  toggleChat: () =>
    set((state) => ({ isChatOpen: !state.isChatOpen })),

  // Reset
  resetMeeting: () => {
    const { localStream, peers } = get();

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Stop all peer streams
    peers.forEach((peer) => {
      peer.stream.getTracks().forEach((track) => track.stop());
    });

    set({
      localStream: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      meetingCode: null,
      isInMeeting: false,
      isSetupComplete: false,
      peers: new Map(),
      isParticipantListOpen: false,
      isChatOpen: false,
    });
  },
}));
