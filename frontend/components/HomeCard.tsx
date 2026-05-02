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

const colorMap: Record<string, { bg: string; text: string; shadow: string; cardBg: string }> = {
  orange: { bg: 'bg-white/20', text: 'text-white', shadow: 'shadow-[0_8px_32px_rgba(249,115,22,0.4)]', cardBg: 'bg-gradient-to-br from-orange-500 to-orange-700' },
  blue: { bg: 'bg-white/20', text: 'text-white', shadow: 'shadow-[0_8px_32px_rgba(59,130,246,0.4)]', cardBg: 'bg-gradient-to-br from-blue-500 to-blue-700' },
  purple: { bg: 'bg-white/20', text: 'text-white', shadow: 'shadow-[0_8px_32px_rgba(168,85,247,0.4)]', cardBg: 'bg-gradient-to-br from-purple-500 to-purple-700' },
  yellow: { bg: 'bg-white/20', text: 'text-white', shadow: 'shadow-[0_8px_32px_rgba(234,179,8,0.4)]', cardBg: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
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
        'relative flex flex-col justify-between w-full min-h-[260px] rounded-[36px] p-10 cursor-pointer group transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] text-left overflow-hidden border border-white/5 shadow-2xl',
        theme.cardBg
      )}
      id={`home-card-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 opacity-50" />
      
      {/* Hover Light Effect */}
      <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

      <div className={cn(
        'relative flex items-center justify-center w-14 h-14 rounded-[18px] transition-all duration-500 mb-10 bg-white/20 backdrop-blur-md border border-white/10 group-hover:rotate-6 shadow-xl',
        theme.shadow
      )}>
        <Icon className="size-7 text-white" />
      </div>

      <div className="relative flex flex-col mt-auto">
        <h3 className="text-2xl font-black text-white tracking-tight leading-tight mb-3">{title}</h3>
        <p className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors duration-300 leading-relaxed max-w-[200px]">{description}</p>
      </div>
    </button>
  );
};

export default HomeCard;
