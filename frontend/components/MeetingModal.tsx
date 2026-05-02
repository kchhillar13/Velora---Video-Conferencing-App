'use client';

import { useState } from 'react';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'create' | 'join';
  meetingLink?: string;
  onSubmit?: (value: string) => void;
  isLoading?: boolean;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  type,
  meetingLink,
  onSubmit,
  isLoading = false,
}: MeetingModalProps) => {
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (meetingLink) {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = () => {
    if (onSubmit && inputValue.trim()) {
      onSubmit(inputValue.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg mx-4 bg-zinc-950 rounded-[2.5rem] p-10 border border-white/5 animate-scale-in shadow-[0_0_60px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 hover:bg-white/5 rounded-xl transition-colors"
          aria-label="Close modal"
        >
          <X className="size-6 text-zinc-500 hover:text-white" />
        </button>

        {/* Title */}
        <h2 className="text-3xl font-black text-white mb-8 tracking-tighter">{title}</h2>

        {/* Content based on type */}
        {type === 'create' && meetingLink && (
          <div className="space-y-6">
            <p className="text-zinc-400 font-medium">
              Invite others to join the conversation:
            </p>
            <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
              <code className="flex-1 text-sm text-blue-500 font-mono break-all">{meetingLink}</code>
              <button
                onClick={handleCopy}
                className={cn(
                  'p-3 rounded-xl transition-all',
                  copied ? 'bg-green-600/20 text-green-500' : 'hover:bg-white/10 text-zinc-400'
                )}
              >
                {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
              </button>
            </div>
          </div>
        )}

        {type === 'join' && (
          <div className="space-y-6">
            <p className="text-zinc-400 font-medium">
              Paste the meeting link or code below:
            </p>
            <input
              type="text"
              placeholder="vel-xxxx-xxxx"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-white/5 text-white rounded-2xl px-6 py-4 border border-white/5 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-zinc-600 font-medium"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-2xl transition-all flex-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Meeting'
              )}
            </button>
          </div>
        )}

        {type === 'create' && !meetingLink && (
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Meeting title (optional)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-white/5 text-white rounded-2xl px-6 py-4 border border-white/5 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-zinc-600 font-medium"
            />
            <button
              onClick={() => onSubmit?.(inputValue || 'Instant Meeting')}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-2xl transition-all flex-center gap-3 shadow-[0_0_30_rgba(37,99,235,0.3)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Start Meeting'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingModal;
