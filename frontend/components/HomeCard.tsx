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

const colorMap: Record<string, { bg: string; text: string; borderHover: string }> = {
  orange: { bg: 'bg-orange-1/20', text: 'text-orange-1', borderHover: 'hover:border-orange-1/50 hover:shadow-[0_0_15px_rgba(255,116,46,0.3)]' },
  blue: { bg: 'bg-blue-1/20', text: 'text-blue-1', borderHover: 'hover:border-blue-1/50 hover:shadow-[0_0_15px_rgba(14,120,249,0.3)]' },
  purple: { bg: 'bg-purple-1/20', text: 'text-purple-1', borderHover: 'hover:border-purple-1/50 hover:shadow-[0_0_15px_rgba(131,14,249,0.3)]' },
  yellow: { bg: 'bg-yellow-1/20', text: 'text-yellow-1', borderHover: 'hover:border-yellow-1/50 hover:shadow-[0_0_15px_rgba(249,169,14,0.3)]' },
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
        'relative flex flex-col items-start gap-4 w-full rounded-[14px] p-6 cursor-pointer group transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden',
        'bg-dark-1 border border-white/5',
        theme.borderHover
      )}
      id={`home-card-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className={cn('relative flex items-center justify-center w-12 h-12 rounded-[10px] transition-all duration-300', theme.bg)}>
        <Icon className={cn('size-6', theme.text)} />
      </div>

      <div className="relative flex flex-col gap-1 mt-2">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-sm font-medium text-white/70">{description}</p>
      </div>
    </button>
  );
};

export default HomeCard;
