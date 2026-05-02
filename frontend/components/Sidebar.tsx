'use client';

import { sidebarLinks } from '@/constants';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Home,
  Calendar,
  Clock,
  Video,
  User,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Home,
  Calendar,
  Clock,
  Video,
  User,
};

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="flex h-full w-fit flex-col justify-between bg-zinc-950 px-8 py-10 text-white max-sm:hidden lg:w-[300px] border-r border-white/5 shadow-2xl shrink-0">
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
                'flex gap-5 items-center p-5 rounded-2xl justify-start transition-all duration-300 group relative ml-1',
                {
                  'bg-blue-600/10 text-blue-500': isActive,
                  'hover:bg-white/5 text-zinc-400 hover:text-white': !isActive,
                }
              )}
            >
              {isActive && (
                <div className="absolute left-[-10px] w-1.5 h-8 bg-blue-600 rounded-r-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
              )}
              <Icon
                className={cn('size-6 transition-transform duration-300 group-hover:scale-110', {
                  'text-blue-500': isActive,
                  'text-zinc-500 group-hover:text-white': !isActive,
                })}
              />
              <p
                className={cn(
                  'text-sm font-semibold max-lg:hidden transition-colors',
                  {
                    'text-white': isActive,
                  }
                )}
              >
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
