'use client';

import {
  type MeetingResponse,
  updateMeetingStatus,
  deleteMeeting,
} from '@/lib/api';
import {
  Calendar,
  Clock,
  Users,
  Copy,
  Check,
  Square,
  XCircle,
  Loader2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { getToken } = useAuth();
  const { updateMeetingInList, removeMeetingFromList } = useMeetingStore();

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

  const handleDelete = async () => {
    if (!confirmDelete) {
      // First click: show confirmation prompt
      setConfirmDelete(true);
      // Auto-reset after 4 seconds so it doesn't stay stuck
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }

    // Second click: confirmed — perform deletion
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (!token) return;

      // Optimistic removal from Zustand — card disappears instantly
      removeMeetingFromList(meeting.id);

      // Fire DELETE to backend
      await deleteMeeting(token, meeting.id);
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      // On failure we can't easily restore the card without re-fetching,
      // so just log — in production you'd trigger a toast + refetch.
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
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
    <div className="bg-dark-1 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group flex flex-col gap-5">

      {/* ── Header row: date + status badge ─────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {type === 'upcoming' ? (
            <Calendar className="size-4 text-blue-1 shrink-0" />
          ) : (
            <Clock className="size-4 text-gray-400 shrink-0" />
          )}
          <span className="text-sm text-gray-400">
            {formatDate(meeting.scheduledAt || meeting.createdAt)}
          </span>
        </div>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold shrink-0',
            statusColors[meeting.status] || statusColors.PENDING
          )}
        >
          {meeting.status}
        </span>
      </div>

      {/* ── Title + meeting code ──────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-white group-hover:text-blue-1 transition-colors leading-snug">
          {meeting.title}
        </h3>
        <p className="text-xs text-gray-500 font-mono tracking-wider">
          {meeting.meetingCode}
        </p>
      </div>

      {/* ── Footer row: participants + actions ───────────────── */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">

        {/* Participant count */}
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="size-4 shrink-0" />
          <span className="text-sm">
            {meeting._count?.participants ?? 0} participant{(meeting._count?.participants ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">

          {/* Copy meeting link */}
          <button
            onClick={handleCopy}
            className={cn(
              'p-2 rounded-lg transition-all',
              copied
                ? 'bg-green-1/20 text-green-1'
                : 'hover:bg-dark-3 text-gray-400 hover:text-white'
            )}
            title="Copy meeting link"
            id={`copy-link-${meeting.id}`}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>

          {/* ─ Upcoming meeting controls ─ */}
          {type === 'upcoming' && meeting.status !== 'ENDED' && (
            <>
              <button
                onClick={() => handleUpdateStatus('ENDED')}
                disabled={endingStatus !== null}
                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all disabled:opacity-50"
                title="End meeting"
                id={`end-meeting-${meeting.id}`}
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
              id={`cancel-meeting-${meeting.id}`}
            >
              {endingStatus ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}
            </button>
          )}

          {/* ─ Delete button — previous meetings only ─ */}
          {type === 'previous' && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50',
                confirmDelete
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/40'
                  : 'hover:bg-dark-3 text-gray-400 hover:text-red-400'
              )}
              title={confirmDelete ? 'Click again to confirm deletion' : 'Delete this meeting'}
              id={`delete-meeting-${meeting.id}`}
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : confirmDelete ? (
                <>
                  <AlertTriangle className="size-4" />
                  <span>Confirm</span>
                </>
              ) : (
                <Trash2 className="size-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
