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
      
      <div className="relative w-full max-w-4xl flex flex-col items-center bg-zinc-900/40 backdrop-blur-3xl p-6 md:p-10 rounded-[2rem] border border-white/5 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter">
            Ready to dive in?
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-zinc-400 text-xs font-medium">
            <Settings className="size-3.5 text-blue-500" />
            Meeting Room: <span className="text-white font-mono">{meetingCode}</span>
          </div>
        </div>

        {/* Video Preview */}
        <div className="relative w-full rounded-[1.5rem] overflow-hidden bg-zinc-950 aspect-video mb-8 border border-white/5 shadow-2xl group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]" />
          {localStream && isVideoEnabled ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100 transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-950">
              <div className="flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-zinc-900 border border-white/5 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-20 rounded-full animate-pulse" />
                  <VideoOff className="size-10 text-white relative z-10" />
                </div>
                <p className="text-zinc-500 font-bold tracking-widest text-xs uppercase">Camera is disabled</p>
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
            className="group relative w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black text-lg px-12 py-4 rounded-[1.5rem] transition-all duration-500 hover:scale-[1.05] active:scale-[0.95] shadow-[0_0_50px_rgba(37,99,235,0.3)] overflow-hidden border border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_3s_infinite]" />
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;
