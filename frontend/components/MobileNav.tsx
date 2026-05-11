'use client';

import { sidebarLinks } from '@/constants';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Home, Calendar, Clock, Files, User, Video, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Home,
  Calendar,
  Clock,
  Files,
  User,
};

const MobileNav = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="size-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          {/* Sheet */}
          <div
            className="fixed left-0 top-0 h-full w-[280px] bg-zinc-950 p-6 animate-slide-in border-r border-white/5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-lg">
                  <Video className="size-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white">VELORA</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                aria-label="Close menu"
              >
                <X className="size-5 text-zinc-500" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {sidebarLinks.map((link) => {
                const isActive =
                  pathname === link.route ||
                  pathname.startsWith(`${link.route}/`);
                const Icon = iconMap[link.icon] || Home;

                return (
                  <Link
                    href={link.route}
                    key={link.label}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex gap-4 items-center py-6 px-6 rounded-xl transition-all duration-300',
                      {
                        'bg-white/5 text-white': isActive,
                        'text-zinc-500 hover:text-white hover:bg-white/5': !isActive,
                      }
                    )}
                  >
                    <Icon
                      className={cn('size-6', {
                        'text-white': isActive,
                        'text-zinc-500': !isActive,
                      })}
                    />
                    <p className="text-base font-medium">
                      {link.label}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
