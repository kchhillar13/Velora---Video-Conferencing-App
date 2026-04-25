'use client';

import Link from 'next/link';
import { UserButton, useAuth } from '@clerk/nextjs';
import { Video } from 'lucide-react';
import MobileNav from './MobileNav';

const Navbar = () => {
  const { isSignedIn } = useAuth();

  return (
    <nav
      className="flex-between fixed z-50 w-full h-[72px] bg-dark-1/90 backdrop-blur-xl px-6 lg:px-10 border-b border-white/5"
      id="velora-navbar"
    >
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-1/20 rounded-lg blur-md group-hover:bg-blue-1/30 transition-colors duration-300" />
          <div className="relative bg-gradient-to-br from-blue-1 to-purple-1 p-2 rounded-lg shadow-lg shadow-blue-1/20">
            <Video className="size-5 text-white" />
          </div>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-sky-1 bg-clip-text text-transparent max-sm:hidden">
          Velora
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {isSignedIn && (
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9 ring-2 ring-white/10 ring-offset-2 ring-offset-dark-1',
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
