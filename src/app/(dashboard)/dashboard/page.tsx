'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, FileText, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface DashboardStats {
  messages: {
    total: number;
    byStatus: {
      sent: number;
      delivered: number;
      read: number;
      failed: number;
    };
    dailyCounts: Array<{
      date: string;
      count: number;
    }>;
  };
  templates: {
    total: number;
    byCategory: Record<string, number>;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSuccessRate = () => {
    if (!stats?.messages.byStatus) return 0;
    const total = Object.values(stats.messages.byStatus).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    const successful = (stats.messages.byStatus.delivered || 0) + (stats.messages.byStatus.read || 0);
    return Math.round((successful / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between sm:mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Overview of your WhatsApp messaging activity</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/messages" className="relative group rounded-lg border border-gray-200 bg-white p-6 hover:border-green-200 hover:ring-1 hover:ring-green-200 focus:outline-none focus:ring-2 focus:ring-green-500">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Send Message</h3>
              <p className="mt-1 text-sm text-gray-500">Create and send new messages</p>
            </div>
          </div>
        </Link>

        <Link href="/bulk" className="relative group rounded-lg border border-gray-200 bg-white p-6 hover:border-green-200 hover:ring-1 hover:ring-green-200 focus:outline-none focus:ring-2 focus:ring-green-500">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 group-hover:bg-green-100">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Bulk Messages</h3>
              <p className="mt-1 text-sm text-gray-500">Send messages to multiple contacts</p>
            </div>
          </div>
        </Link>

        <Link href="/templates" className="relative group rounded-lg border border-gray-200 bg-white p-6 hover:border-green-200 hover:ring-1 hover:ring-green-200 focus:outline-none focus:ring-2 focus:ring-green-500">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 group-hover:bg-purple-100">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Templates</h3>
              <p className="mt-1 text-sm text-gray-500">Manage message templates</p>
            </div>
          </div>
        </Link>

        <Link href="/contacts" className="relative group rounded-lg border border-gray-200 bg-white p-6 hover:border-green-200 hover:ring-1 hover:ring-green-200 focus:outline-none focus:ring-2 focus:ring-green-500">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-50 group-hover:bg-yellow-100">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
              <p className="mt-1 text-sm text-gray-500">Manage your contacts</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">Total Messages</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stats?.messages.total || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-50">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">Total Contacts</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">Success Rate</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{calculateSuccessRate()}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Status Breakdown */}
      {stats?.messages.byStatus && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Message Status Breakdown</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <p className="text-sm font-medium text-gray-500">Sent</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.messages.byStatus.sent || 0}</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.messages.byStatus.delivered || 0}</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <p className="text-sm font-medium text-gray-500">Read</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.messages.byStatus.read || 0}</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.messages.byStatus.failed || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 