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
    <section className="sticky left-0 top-[72px] flex h-[calc(100dvh-72px)] w-fit flex-col justify-between bg-zinc-950 p-6 pt-8 text-white max-sm:hidden lg:w-[264px] border-r border-white/10 shadow-2xl">
      <div className="flex flex-1 flex-col gap-2">
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
                'flex gap-4 items-center p-4 rounded-xl justify-start transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]',
                {
                  'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]': isActive,
                  'hover:bg-zinc-800': !isActive,
                }
              )}
            >
              <Icon
                className={cn('size-5 transition-colors', {
                  'text-white': isActive,
                  'text-zinc-400 group-hover:text-white': !isActive,
                })}
              />
              <p
                className={cn(
                  'text-base font-medium max-lg:hidden transition-colors',
                  {
                    'text-white font-semibold': isActive,
                    'text-zinc-400 group-hover:text-white': !isActive,
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
