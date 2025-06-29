'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  MessageSquare, 
  Users, 
  FileText, 
  Send,
  LayoutDashboard,
  Settings,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Send Message',
    href: '/messages',
    icon: MessageSquare
  },
  {
    name: 'Bulk Messages',
    href: '/bulk',
    icon: Send
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: FileText
  },
  {
    name: 'Contacts',
    href: '/contacts',
    icon: Users
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    // Handle both exact matches and sub-paths
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-600/75 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:shadow-md
        `}
      >
        {/* Sidebar header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-lg font-semibold text-gray-900">WhatsApp Flow</span>
            </div>
            <button
              type="button"
              className="lg:hidden rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-x-3 rounded-md px-3 py-2.5 text-sm font-medium
                  ${active 
                    ? 'bg-gray-100 text-green-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                  }
                `}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Stats */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Total Messages</span>
              <span className="text-sm font-medium text-gray-900">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Total Contacts</span>
              <span className="text-sm font-medium text-gray-900">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Success Rate</span>
              <span className="text-sm font-medium text-green-600">100%</span>
            </div>
          </div>
        </div>

        {/* Logout button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-100 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}