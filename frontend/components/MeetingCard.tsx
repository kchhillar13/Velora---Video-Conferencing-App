'use client';

import { type MeetingResponse, updateMeetingStatus } from '@/lib/api';
import { Calendar, Clock, Users, Copy, Check, Square, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useMeetingStore } from '@/store/meeting.store';

interface MeetingCardProps {
  meeting: MeetingResponse;
  type: 'upcoming' | 'previous';
}

const MeetingCard = ({ meeting, type }: MeetingCardProps) => {
  const [copied, setCopied] = useState(false);
  const [endingStatus, setEndingStatus] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { updateMeetingInList } = useMeetingStore();

  const handleCopy = async () => {
    const link = `${window.location.origin}/meeting/${meeting.meetingCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateStatus = async (newStatus: 'ENDED' | 'ACTIVE') => {
    setEndingStatus(newStatus);
    try {
      const token = await getToken();
      if (!token) return;

      // Optimistic UI update — update Zustand store immediately
      updateMeetingInList(meeting.id, {
        status: newStatus,
        ...(newStatus === 'ENDED' ? { endedAt: new Date().toISOString() } : {}),
        ...(newStatus === 'ACTIVE' ? { startedAt: new Date().toISOString() } : {}),
      });

      // Fire the API call
      await updateMeetingStatus(token, meeting.id, newStatus);
    } catch (error) {
      console.error(`Failed to update meeting status to ${newStatus}:`, error);
      // Revert optimistic update on failure
      updateMeetingInList(meeting.id, { status: meeting.status });
    } finally {
      setEndingStatus(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-1/20 text-yellow-1',
    ACTIVE: 'bg-green-1/20 text-green-1',
    ENDED: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div className="bg-dark-1 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {type === 'upcoming' ? (
            <Calendar className="size-4 text-blue-1" />
          ) : (
            <Clock className="size-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-400">
            {formatDate(meeting.scheduledAt || meeting.createdAt)}
          </span>
        </div>
        <span
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            statusColors[meeting.status] || statusColors.PENDING
          )}
        >
          {meeting.status}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-1 transition-colors">
        {meeting.title}
      </h3>

      <p className="text-sm text-gray-500 mb-4 font-mono">
        {meeting.meetingCode}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="size-4" />
          <span className="text-sm">
            {meeting._count?.participants || 0} participants
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={cn(
              'p-2 rounded-lg transition-all',
              copied ? 'bg-green-1/20 text-green-1' : 'hover:bg-dark-3 text-gray-400'
            )}
            title="Copy meeting link"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>

          {/* End Meeting button — show for upcoming/active meetings */}
          {type === 'upcoming' && meeting.status !== 'ENDED' && (
            <>
              <button
                onClick={() => handleUpdateStatus('ENDED')}
                disabled={endingStatus !== null}
                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all disabled:opacity-50"
                title="End meeting"
              >
                {endingStatus === 'ENDED' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Square className="size-4" />
                )}
              </button>

              <Link
                href={`/meeting/${meeting.meetingCode}`}
                className="px-4 py-2 bg-blue-1 hover:bg-blue-1/90 text-white text-sm font-medium rounded-xl transition-all"
              >
                Start
              </Link>
            </>
          )}

          {/* Cancel button — only for PENDING meetings */}
          {type === 'upcoming' && meeting.status === 'PENDING' && (
            <button
              onClick={() => handleUpdateStatus('ENDED')}
              disabled={endingStatus !== null}
              className="p-2 rounded-lg hover:bg-orange-1/20 text-gray-400 hover:text-orange-1 transition-all disabled:opacity-50"
              title="Cancel meeting"
            >
              {endingStatus ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
