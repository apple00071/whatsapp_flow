'use client';

import { useState, useEffect } from 'react';

interface WhatsAppStatus {
  isConnected: boolean;
  hasQR: boolean;
  qrCode: string | null;
  error?: string;
  state?: string;
}

export function WhatsAppStatus() {
  const [status, setStatus] = useState<WhatsAppStatus>({
    isConnected: false,
    hasQR: false,
    qrCode: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        console.log('Fetching WhatsApp status...'); // Debug log
        const response = await fetch('http://localhost:3001/api/whatsapp/status');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Status data:', data); // Debug log
        
        setStatus({
          isConnected: data.isConnected || false,
          hasQR: data.hasQR || false,
          qrCode: data.qrCode || null,
          state: data.state || 'disconnected'
        });
      } catch (error) {
        console.error('Error fetching status:', error);
        setStatus(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Failed to fetch status' }));
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Increased interval to 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-3 text-sm text-gray-500">Loading WhatsApp status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-x-3">
          <div className={`h-2.5 w-2.5 rounded-full ${status.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`text-sm font-medium ${status.isConnected ? 'text-green-700' : 'text-red-700'}`}>
            {status.isConnected ? 'Connected' : 'Disconnected'}
            {status.state && status.state !== 'disconnected' && ` (${status.state})`}
          </span>
        </div>
      </div>
      
      {/* Debug info */}
      <div className="mb-4 text-xs text-gray-500">
        <p>Has QR: {String(status.hasQR)}</p>
        <p>QR Code Length: {status.qrCode ? status.qrCode.length : 0}</p>
      </div>
      
      {/* QR Code display */}
      {!status.isConnected && status.qrCode && (
        <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-900">Scan this QR code with WhatsApp to start messaging</p>
          <div className="overflow-hidden rounded-lg bg-white p-2 shadow-sm">
            <img 
              src={status.qrCode}
              alt="WhatsApp QR Code" 
              width={200} 
              height={200}
              className="h-[200px] w-[200px]"
            />
          </div>
          <p className="mt-3 text-xs text-gray-500">Open WhatsApp on your phone, tap Menu or Settings and select WhatsApp Web</p>
        </div>
      )}

      {!status.isConnected && !status.qrCode && !loading && (
        <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-3 text-sm text-gray-500">Waiting for QR code...</p>
        </div>
      )}

      {status.error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">{status.error}</p>
        </div>
      )}
    </div>
  );
} 