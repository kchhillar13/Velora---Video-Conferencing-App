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

interface HomeCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onClick: () => void;
}

const HomeCard = ({ title, description, icon, color, onClick }: HomeCardProps) => {
  const Icon = iconMap[icon] || Plus;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col justify-between w-full min-h-[260px] rounded-2xl p-6 cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl text-left overflow-hidden',
        color
      )}
      id={`home-card-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Decorative glow orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative glassmorphism flex-center size-12 rounded-xl group-hover:scale-110 transition-transform duration-300">
        <Icon className="size-6 text-white" />
      </div>

      <div className="relative flex flex-col gap-1">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-lg font-normal text-white/70">{description}</p>
      </div>
    </button>
  );
};

export default HomeCard;
