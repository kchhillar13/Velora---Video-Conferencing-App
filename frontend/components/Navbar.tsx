'use client';

import Link from 'next/link';
import { UserButton, useAuth } from '@clerk/nextjs';
import { Video } from 'lucide-react';
import MobileNav from './MobileNav';

const Navbar = () => {
  const { isSignedIn } = useAuth();

  return (
    <nav
      className="flex justify-center items-center w-full h-16 bg-zinc-950 shrink-0 z-50 border-b border-white/5"
      id="velora-navbar"
    >
      <div className="flex justify-between items-center w-full max-w-[1700px] px-12 md:px-16 lg:px-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl border border-white/10 shadow-lg">
            <Video className="size-6 text-white" />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="text-xl font-black tracking-tighter text-white">
              VELORA
            </span>
            <span className="text-[8px] font-bold text-zinc-500 tracking-[0.2em] leading-none uppercase">
              Conference
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {isSignedIn && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10 rounded-xl ring-2 ring-white/10 hover:ring-blue-500/50 transition-all duration-300',
                },
              }}
            />
          )}
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
