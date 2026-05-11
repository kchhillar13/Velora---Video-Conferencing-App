'use client';

import { cn } from '@/lib/utils';
import {
  Plus,
  UserPlus,
  Calendar,
  Video,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Plus,
  UserPlus,
  Calendar,
  Video,
};

const colorMap: Record<string, { bg: string; text: string; shadow: string; cardBg: string; iconBg: string }> = {
  orange: { bg: 'bg-orange-500', text: 'text-white', shadow: 'shadow-[0_20px_50px_rgba(249,115,22,0.3)]', cardBg: 'bg-orange-500', iconBg: 'bg-white/20' },
  blue: { bg: 'bg-blue-500', text: 'text-white', shadow: 'shadow-[0_20px_50px_rgba(59,130,246,0.3)]', cardBg: 'bg-blue-500', iconBg: 'bg-white/20' },
  purple: { bg: 'bg-purple-500', text: 'text-white', shadow: 'shadow-[0_20px_50px_rgba(168,85,247,0.3)]', cardBg: 'bg-purple-500', iconBg: 'bg-white/20' },
  yellow: { bg: 'bg-yellow-500', text: 'text-white', shadow: 'shadow-[0_20px_50px_rgba(234,179,8,0.3)]', cardBg: 'bg-yellow-500', iconBg: 'bg-white/20' },
};

interface HomeCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onClick: () => void;
}

const HomeCard = ({ title, description, icon, color, onClick }: HomeCardProps) => {
  const Icon = iconMap[icon] || Plus;
  const theme = colorMap[color] || colorMap.blue;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center w-full min-h-[200px] rounded-[32px] p-8 cursor-pointer group transition-all duration-500 hover:scale-[1.05] active:scale-[0.95] text-center overflow-hidden',
        theme.cardBg,
        theme.shadow
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-transform duration-500 group-hover:scale-110 shadow-lg',
        theme.iconBg
      )}>
        <Icon className="size-8 text-white" />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
        <p className="text-xs font-medium text-white/80">{description}</p>
      </div>
    </button>
  );
};

export default HomeCard;
