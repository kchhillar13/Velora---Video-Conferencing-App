'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getUserMeetings } from '@/lib/api';
import { useMeetingStore } from '@/store/meeting.store';
import MeetingCard from '@/components/MeetingCard';
import Loader from '@/components/Loader';
import { Clock } from 'lucide-react';

export default function PreviousPage() {
  const { getToken } = useAuth();
  const { meetings, meetingsLoading, setMeetings, setMeetingsLoading } =
    useMeetingStore();

  useEffect(() => {
    const fetchMeetings = async () => {
      setMeetingsLoading(true);
      try {
        const token = await getToken();
        if (token) {
          const data = await getUserMeetings(token, 'previous');
          setMeetings(data);
        }
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
      } finally {
        setMeetingsLoading(false);
      }
    };
    fetchMeetings();
  }, [getToken, setMeetings, setMeetingsLoading]);

  if (meetingsLoading) return <Loader />;

  return (
    <section className="flex size-full flex-col gap-8 text-white">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Previous Meetings</h1>
        <p className="text-sm text-gray-400">
          Your completed sessions — click the trash icon to remove any entry from history.
        </p>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      {meetings.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
          <div className="flex-center size-20 rounded-full bg-dark-3">
            <Clock className="size-10 text-gray-500" />
          </div>
          <p className="text-lg font-medium text-gray-300">No previous meetings</p>
          <p className="text-sm text-gray-500">Your completed meetings will appear here.</p>
        </div>
      ) : (
        <>
          {/* Meeting count */}
          <p className="text-sm text-gray-500 -mt-4">
            {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} in history
          </p>

          {/* Grid of cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} type="previous" />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
