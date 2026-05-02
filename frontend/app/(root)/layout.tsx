import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ReactNode } from 'react';

const HomeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex flex-col h-screen bg-dark-2 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <section className="flex flex-1 flex-col overflow-y-auto px-8 pb-12 pt-10 md:px-12 lg:px-16 xl:px-20">
          <div className="w-full max-w-[1360px] mx-auto">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomeLayout;
