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
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Upcoming Meetings</h1>

      {upcomingMeetings.length === 0 ? (
        <div className="flex-center flex-col gap-4 py-20">
          <Calendar className="size-16 text-gray-500" />
          <p className="text-lg text-gray-400">No upcoming meetings</p>
          <p className="text-sm text-gray-500">Create a new meeting to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} type="upcoming" />
          ))}
        </div>
      )}
    </section>
  );
}
