'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useMeetingStore } from '@/store/meeting.store';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useMediaStream } from '@/hooks/useMediaStream';
import VideoTile from './VideoTile';
import MediaControls from './MediaControls';
import ParticipantList from './ParticipantList';
import { cn } from '@/lib/utils';

interface MeetingRoomProps {
  meetingCode: string;
}

const MeetingRoom = ({ meetingCode }: MeetingRoomProps) => {
  const router = useRouter();
  const { user } = useUser();
  const { connect, disconnect, socketRef } = useSocket();
  const { getScreenShare } = useMediaStream();
  const joinedRef = useRef(false);

  const {
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    peers,
    isParticipantListOpen,
    setAudioEnabled,
    setVideoEnabled,
    setScreenSharing,
    setIsInMeeting,
    toggleParticipantList,
    resetMeeting,
  } = useMeetingStore();

  const { replaceVideoTrack, closeAllConnections, setLocalStream } = useWebRTC(
    socketRef.current,
    meetingCode
  );

  // ─── Join the meeting room ─────────────────────────

  const joinMeeting = useCallback(() => {
    if (!user || !localStream || joinedRef.current) return;
    joinedRef.current = true;

    setLocalStream(localStream);
    const socket = connect();

    const emitJoin = () => {
      socket.emit('join-room', {
        meetingCode,
        userId: user.id,
        userName: user.fullName || user.firstName || 'Anonymous',
      });
      setIsInMeeting(true);
    };

    if (socket.connected) {
      // Socket is already connected — emit immediately
      emitJoin();
    } else {
      // Wait for connection — use .once() to prevent duplicate handlers
      socket.once('connect', emitJoin);
    }
  }, [user, localStream, meetingCode, connect, setLocalStream, setIsInMeeting]);

  // ─── Auto-join when localStream is ready ──────────

  useEffect(() => {
    if (localStream && user && !joinedRef.current) {
      joinMeeting();
    }
  }, [localStream, user, joinMeeting]);

  // ─── Toggle Audio ─────────────────────────────────

  const handleToggleAudio = useCallback(() => {
    const newState = !isAudioEnabled;
    setAudioEnabled(newState);

    if (socketRef.current?.connected) {
      socketRef.current.emit('toggle-audio', {
        meetingCode,
        enabled: newState,
      });
    }
  }, [isAudioEnabled, setAudioEnabled, meetingCode, socketRef]);

  // ─── Toggle Video ─────────────────────────────────

  const handleToggleVideo = useCallback(() => {
    const newState = !isVideoEnabled;
    setVideoEnabled(newState);

    if (socketRef.current?.connected) {
      socketRef.current.emit('toggle-video', {
        meetingCode,
        enabled: newState,
      });
    }
  }, [isVideoEnabled, setVideoEnabled, meetingCode, socketRef]);

  // ─── Screen Share ─────────────────────────────────

  const handleToggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share → restore camera track
      if (localStream) {
        const cameraTrack = localStream.getVideoTracks()[0];
        if (cameraTrack) {
          replaceVideoTrack(cameraTrack);
        }
      }
      setScreenSharing(false);

      if (socketRef.current?.connected) {
        socketRef.current.emit('screen-share-stopped', { meetingCode });
      }
    } else {
      // Start screen share
      const screenStream = await getScreenShare();
      if (!screenStream) return;

      const screenTrack = screenStream.getVideoTracks()[0];
      if (screenTrack) {
        replaceVideoTrack(screenTrack);
        setScreenSharing(true);

        if (socketRef.current?.connected) {
          socketRef.current.emit('screen-share-started', { meetingCode });
        }

        // When user stops screen share via browser UI
        screenTrack.onended = () => {
          if (localStream) {
            const cameraTrack = localStream.getVideoTracks()[0];
            if (cameraTrack) {
              replaceVideoTrack(cameraTrack);
            }
          }
          setScreenSharing(false);

          if (socketRef.current?.connected) {
            socketRef.current.emit('screen-share-stopped', { meetingCode });
          }
        };
      }
    }
  }, [
    isScreenSharing,
    localStream,
    meetingCode,
    replaceVideoTrack,
    setScreenSharing,
    getScreenShare,
    socketRef,
  ]);

  // ─── Leave Meeting ────────────────────────────────

  const handleLeave = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-room', { meetingCode });
    }
    closeAllConnections();
    disconnect();
    resetMeeting();
    joinedRef.current = false;
    router.push('/');
  }, [meetingCode, closeAllConnections, disconnect, resetMeeting, router, socketRef]);

  // ─── Grid Layout ──────────────────────────────────

  const totalParticipants = peers.size + 1; // +1 for local
  const getGridClass = () => {
    if (totalParticipants === 1) return 'video-grid-1';
    if (totalParticipants === 2) return 'video-grid-2';
    if (totalParticipants <= 4) return 'video-grid-4';
    return 'video-grid-many';
  };

  const userName = user?.fullName || user?.firstName || 'You';

  return (
    <div className="flex h-dvh bg-dark-2">
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Video Grid */}
        <div className="flex-1 relative overflow-hidden">
          <div className={cn('video-grid', getGridClass())}>
            {/* Local Video */}
            <VideoTile
              stream={localStream}
              userName={userName}
              isLocal
              audioEnabled={isAudioEnabled}
              videoEnabled={isVideoEnabled}
              isScreenSharing={isScreenSharing}
            />

            {/* Remote Peers */}
            {Array.from(peers.entries()).map(([socketId, peer]) => (
              <VideoTile
                key={socketId}
                stream={peer.stream}
                userName={peer.userName}
                audioEnabled={peer.audioEnabled}
                videoEnabled={peer.videoEnabled}
                isScreenSharing={peer.isScreenSharing}
              />
            ))}
          </div>

          {/* Participant List Panel */}
          <ParticipantList
            isOpen={isParticipantListOpen}
            onClose={toggleParticipantList}
            localUserName={userName}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            peers={peers}
          />
        </div>

        {/* Controls Bar */}
        <div className="bg-dark-1 border-t border-white/5">
          <MediaControls
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isScreenSharing={isScreenSharing}
            isParticipantListOpen={isParticipantListOpen}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
            onToggleParticipants={toggleParticipantList}
            onLeave={handleLeave}
            participantCount={totalParticipants}
          />
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
