'use client';

import { sidebarLinks } from '@/constants';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Home,
  Calendar,
  Clock,
  Files,
  User,
  Video,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Home,
  Calendar,
  Clock,
  Files,
  User,
};

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="flex h-screen w-fit flex-col justify-between bg-zinc-950 pl-12 pr-6 py-10 text-white max-sm:hidden lg:w-[280px] border-r border-white/5 shrink-0">
      <div className="flex flex-1 flex-col gap-4">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.route ||
            pathname.startsWith(`${link.route}/`);
          const Icon = iconMap[link.icon] || Home;

          return (
            <Link
              href={link.route}
              key={link.label}
              className={cn(
                'flex gap-4 items-center py-6 px-6 rounded-xl justify-start transition-all duration-300 group',
                {
                  'bg-white/5 text-white': isActive,
                  'text-zinc-500 hover:text-white hover:bg-white/5': !isActive,
                }
              )}
            >
              <Icon
                className={cn('size-6 transition-transform duration-300 group-hover:scale-110', {
                  'text-white': isActive,
                  'text-zinc-500 group-hover:text-white': !isActive,
                })}
              />
              <p className="text-base font-medium max-lg:hidden">
                {link.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Sidebar;
