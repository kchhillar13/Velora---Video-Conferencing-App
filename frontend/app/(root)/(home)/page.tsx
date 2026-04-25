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
    <section className="flex size-full flex-col gap-10 text-white">
      {/* Hero Banner */}
      <div className="relative h-[303px] w-full rounded-3xl overflow-hidden hero-gradient">
        {/* Decorative orbs */}
        <div className="absolute top-10 right-20 w-32 h-32 bg-blue-1/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-20 w-40 h-40 bg-purple-1/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative flex h-full flex-col justify-between p-8 lg:p-11">
          <div>
            <span className="inline-flex items-center gap-2 py-2 px-4 bg-white/5 backdrop-blur-sm rounded-full text-sky-1 text-sm font-medium border border-white/5">
              <span className="w-2 h-2 rounded-full bg-green-1 animate-pulse" />
              {greeting}, {user?.firstName || 'there'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl bg-gradient-to-r from-white via-white to-sky-1 bg-clip-text text-transparent drop-shadow-lg">
              {time}
            </h1>
            <p className="text-lg font-medium text-sky-1/70 lg:text-2xl">
              {date}
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
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
