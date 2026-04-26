'use client';

import { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMeetingStore } from '@/store/meeting.store';
import { useMediaStream } from '@/hooks/useMediaStream';

interface MeetingSetupProps {
  onJoin: () => void;
  meetingCode: string;
}

const MeetingSetup = ({ onJoin, meetingCode }: MeetingSetupProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { getMediaStream, error: mediaError } = useMediaStream();

  const {
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    setLocalStream,
    setAudioEnabled,
    setVideoEnabled,
  } = useMeetingStore();

  // Get user media on mount
  useEffect(() => {
    const initMedia = async () => {
      const stream = await getMediaStream(true, true);
      if (stream) {
        setLocalStream(stream);
      }
    };
    initMedia();

    return () => {
      // Don't stop stream here — it will be used by MeetingRoom
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const toggleAudio = () => {
    setAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    setVideoEnabled(!isVideoEnabled);
  };

  return (
    <div className="flex items-center justify-center min-h-dvh bg-zinc-950 p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="relative w-full max-w-3xl flex flex-col items-center bg-zinc-900/50 backdrop-blur-2xl p-10 rounded-[2rem] border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Ready to join?</h1>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <Settings className="size-4" />
            Meeting: <span className="text-sky-1 font-mono">{meetingCode}</span>
          </p>
        </div>

        {/* Video Preview */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-zinc-950 aspect-video mb-8 border border-white/5 shadow-2xl ring-1 ring-white/10">
          {localStream && isVideoEnabled ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-950">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-[0_0_40px_rgba(37,99,235,0.4)] text-white relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                  <VideoOff className="size-12 relative z-10" />
                </div>
                <p className="text-zinc-400 font-medium tracking-wide">Camera is off</p>
              </div>
            </div>
          )}

          {/* Media Error */}
          {mediaError && (
            <div className="absolute inset-0 flex-center bg-dark-3/90 backdrop-blur-sm p-4">
              <div className="text-center max-w-sm">
                <VideoOff className="size-10 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 text-sm">{mediaError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={toggleAudio}
            className={cn(
              'control-btn',
              isAudioEnabled ? 'control-btn-active' : 'control-btn-muted'
            )}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={cn(
              'control-btn',
              isVideoEnabled ? 'control-btn-active' : 'control-btn-muted'
            )}
            title={isVideoEnabled ? 'Camera off' : 'Camera on'}
          >
            {isVideoEnabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </button>
        </div>

        {/* Join Button */}
        <div className="flex justify-center w-full mt-4">
          <button
            onClick={onJoin}
            className="group relative w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-16 py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(37,99,235,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_2s_infinite]" />
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;
