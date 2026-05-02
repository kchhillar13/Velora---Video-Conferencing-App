'use client';

import Link from 'next/link';
import { UserButton, useAuth } from '@clerk/nextjs';
import { Video } from 'lucide-react';
import MobileNav from './MobileNav';

const Navbar = () => {
  const { isSignedIn } = useAuth();

  return (
    <nav
      className="flex-between w-full h-20 bg-zinc-950/70 backdrop-blur-3xl px-8 md:px-12 lg:px-16 border-b border-white/5 shrink-0 z-50"
      id="velora-navbar"
    >
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600/40 rounded-xl blur-xl group-hover:bg-blue-600/60 transition-colors duration-500" />
          <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-2xl border border-white/10">
            <Video className="size-6 text-white" />
          </div>
        </div>
        <div className="flex flex-col -gap-1">
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent max-sm:hidden">
            VELORA
          </span>
          <span className="text-[10px] font-bold text-blue-500 tracking-[0.2em] max-sm:hidden leading-none">
            CONFERENCE
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-5">
        {isSignedIn && (
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10 rounded-xl ring-2 ring-white/5 ring-offset-4 ring-offset-zinc-950 hover:ring-blue-500/50 transition-all duration-300',
              },
            }}
          />
        )}
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
