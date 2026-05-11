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
    <section className="flex w-full flex-col items-center justify-start gap-12 text-white pb-12">
      {/* Fixed Spacer to guarantee space at the top */}
      <div className="h-2 w-full block" />

      {/* Centered Hero Section */}
      <div className="flex flex-col items-center justify-center text-center gap-6">
        <div className="px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/5 flex items-center gap-3">
          <p className="text-sm font-medium text-zinc-400 tracking-wide">
            {greeting}, {user?.firstName || 'User'}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-none bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            {time}
          </h1>
          <p className="text-xl md:text-2xl font-bold text-zinc-500 tracking-tight">
            {date}
          </p>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl px-4 pb-12">
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
