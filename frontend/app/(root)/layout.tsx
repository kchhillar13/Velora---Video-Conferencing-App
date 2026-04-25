import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ReactNode } from 'react';

const HomeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="relative min-h-dvh bg-dark-2">
      {/* Fixed Navbar — height is 72px */}
      <Navbar />

      {/* Content area — top padding clears the fixed navbar */}
      <div className="flex pt-[72px]" style={{ minHeight: '100dvh' }}>
        {/* Sidebar — sticky, fills remaining viewport height */}
        <Sidebar />

        {/* Main content */}
        <section className="flex flex-1 flex-col px-6 pb-6 pt-8 max-md:pb-14 sm:px-14 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomeLayout;
