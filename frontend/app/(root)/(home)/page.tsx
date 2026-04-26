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
    <section className="flex size-full flex-col gap-10 text-white max-lg:ml-0 lg:ml-[264px] pr-5">
      {/* Hero Banner */}
      <div className="relative w-full rounded-[20px] overflow-hidden hero-gradient shadow-xl flex flex-col min-h-[280px]">
        {/* Soft gradient background behind the clock is provided by hero-gradient */}
        
        <div className="relative z-10 flex flex-col gap-8 h-full justify-between py-8 px-10 lg:py-12 lg:px-16 flex-1">
          <div className="flex items-start">
            <span className="inline-flex items-center gap-2.5 py-2 px-5 bg-dark-2/40 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/10 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {greeting}, <span className="font-semibold text-white">{user?.firstName || 'there'}</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 mt-auto pt-8">
            <h1 className="text-5xl font-extrabold lg:text-7xl text-white tracking-tighter drop-shadow-md">
              {time}
            </h1>
            <p className="text-lg font-medium text-sky-1 lg:text-xl">
              {date}
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pr-5 pb-5">
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
