'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getUserMeetings } from '@/lib/api';
import { useMeetingStore } from '@/store/meeting.store';
import MeetingCard from '@/components/MeetingCard';
import Loader from '@/components/Loader';
import { Calendar } from 'lucide-react';

export default function UpcomingPage() {
  const { getToken } = useAuth();
  const { meetings, meetingsLoading, setMeetings, setMeetingsLoading } = useMeetingStore();

  useEffect(() => {
    const fetchMeetings = async () => {
      setMeetingsLoading(true);
      try {
        const token = await getToken();
        if (token) {
          const data = await getUserMeetings(token, 'upcoming');
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

  // Filter out meetings that have been ended (optimistic updates may move them to ENDED)
  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'PENDING' || m.status === 'ACTIVE'
  );

  return (
    <section className="flex size-full flex-col gap-8 text-white">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Meetings</h1>
        <p className="text-sm text-gray-400">
          Your scheduled and active sessions.
        </p>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      {upcomingMeetings.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
          <div className="flex-center size-20 rounded-full bg-dark-3">
            <Calendar className="size-10 text-gray-500" />
          </div>
          <p className="text-lg font-medium text-gray-300">No upcoming meetings</p>
          <p className="text-sm text-gray-500">Create a new meeting to get started!</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 -mt-4">
            {upcomingMeetings.length} meeting{upcomingMeetings.length !== 1 ? 's' : ''} scheduled
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} type="upcoming" />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
