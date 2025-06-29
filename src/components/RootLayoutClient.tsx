'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Close sidebar on route change on mobile
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm lg:hidden">
        <nav className="flex h-16 items-center justify-between gap-x-4 px-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          {/* Logo for mobile */}
          <div className="flex items-center gap-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">WhatsApp Flow</span>
          </div>
          
          {/* Spacer to maintain centered logo */}
          <div className="h-10 w-10"></div>
        </nav>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-16 lg:hidden" aria-hidden="true" />
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
} 