'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: string;
  to: string;
  message: string;
  status: 'sent' | 'failed';
  timestamp: string;
}

export function MessageHistory() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/whatsapp/messages');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Refresh messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
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
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by sending your first message.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {messages.map((message) => (
          <li key={message.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="truncate text-sm font-medium text-indigo-600">{message.to}</p>
                  <div className={`ml-2 flex-shrink-0 flex`}>
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      message.status === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {message.status}
                    </p>
                  </div>
                </div>
                <div className="ml-2 flex flex-shrink-0">
                  <p className="text-sm text-gray-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 