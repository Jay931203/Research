'use client';

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />

      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
        }`}
      >
        <div className="mx-auto w-full max-w-[1600px] p-3 sm:p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

