'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import HomeCard from '@/components/HomeCard';
import MeetingModal from '@/components/MeetingModal';
import { homeCards } from '@/constants';
import { createMeeting, syncUser } from '@/lib/api';

const Home = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [now, setNow] = useState(new Date());

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Sync user with backend on first load
  useEffect(() => {
    const sync = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        if (token) {
          await syncUser(token, {
            email: user.emailAddresses[0]?.emailAddress || '',
            name: user.fullName || user.firstName || 'User',
            avatarUrl: user.imageUrl,
          });
        }
      } catch {
        // Silent fail — user sync is non-critical for first load
      }
    };
    sync();
  }, [user, getToken]);

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCardAction = (action: string) => {
    switch (action) {
      case 'instant':
        setMeetingLink(undefined);
        setShowCreateModal(true);
        break;
      case 'join':
        setShowJoinModal(true);
        break;
      case 'schedule':
        router.push('/upcoming');
        break;
      case 'recordings':
        router.push('/recordings');
        break;
    }
  };

  const handleCreateMeeting = async (title: string) => {
    setIsCreating(true);
    try {
      const token = await getToken();
      if (!token) return;

      const meeting = await createMeeting(token, {
        title,
        type: 'INSTANT',
      });

      const link = `${window.location.origin}/meeting/${meeting.meetingCode}`;
      setMeetingLink(link);
    } catch (error) {
      console.error('Failed to create meeting:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = async (codeOrLink: string) => {
    setIsJoining(true);

    // Extract meeting code from link or use as-is
    let code = codeOrLink;
    if (codeOrLink.includes('/meeting/')) {
      code = codeOrLink.split('/meeting/').pop() || codeOrLink;
    }

    router.push(`/meeting/${code}`);
    setIsJoining(false);
  };

  const greeting = (() => {
    const hour = now.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  })();

  return (
    <section className="flex size-full flex-col gap-14 text-white">
      {/* Hero Banner */}
      <div className="relative h-[320px] w-full rounded-[40px] overflow-hidden bg-hero bg-cover shadow-2xl border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/40 to-transparent" />
        
        <div className="relative z-10 flex h-full flex-col justify-between p-10 md:p-14 lg:p-20">
          <div className="flex items-center gap-2">
            <div className="px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
              <p className="text-xs font-black text-sky-1 uppercase tracking-[0.25em]">
                {greeting}, {user?.firstName || 'User'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
              {time}
            </h1>
            <p className="text-xl md:text-2xl font-bold text-zinc-400 max-w-lg tracking-tight ml-1">
              {date}
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
        {homeCards.map((card) => (
          <HomeCard
            key={card.title}
            title={card.title}
            description={card.description}
            icon={card.icon}
            color={card.color}
            onClick={() => handleCardAction(card.action)}
          />
        ))}
      </div>

      {/* Modals */}
      <MeetingModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setMeetingLink(undefined);
        }}
        title={meetingLink ? 'Meeting Created' : 'Create Meeting'}
        type="create"
        meetingLink={meetingLink}
        onSubmit={handleCreateMeeting}
        isLoading={isCreating}
      />

      <MeetingModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join a Meeting"
        type="join"
        onSubmit={handleJoinMeeting}
        isLoading={isJoining}
      />
    </section>
  );
};

export default Home;
