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
  const { meetings, meetingsLoading, setMeetings, setMeetingsLoading } = useMeetingStore();

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
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Previous Meetings</h1>

      {meetings.length === 0 ? (
        <div className="flex-center flex-col gap-4 py-20">
          <Clock className="size-16 text-gray-500" />
          <p className="text-lg text-gray-400">No previous meetings</p>
          <p className="text-sm text-gray-500">Your completed meetings will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} type="previous" />
          ))}
        </div>
      )}
    </section>
  );
}
