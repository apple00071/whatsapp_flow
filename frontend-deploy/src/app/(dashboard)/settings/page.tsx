'use client';

import { useState, useEffect } from 'react';
import { QrCode, RefreshCw } from 'lucide-react';
import { DirectQRCode } from '@/components/DirectQRCode';

interface WhatsAppStatus {
  isConnected: boolean;
  hasQR: boolean;
  qrCode: string | null;
  state: string;
  error?: string;
  isPrerendering?: boolean;
}

export default function SettingsPage() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | undefined>(undefined);
  const [qrLoading, setQrLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // This effect runs only on client-side to set isClient to true
  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchQRCode = async () => {
    try {
      setQrLoading(true);
      console.log('Fetching QR code through proxy endpoint...');
      
      // Use the proxy endpoint instead of the direct API
      const timestamp = Date.now();
      const response = await fetch(`/api/proxy/qr?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('QR code response status:', response.status);
      const data = await response.json();
      console.log('QR code response data:', data);
      
      if (data.success && data.qrCode) {
        console.log('Setting QR code image');
        setQrCodeImage(data.qrCode);
      } else if (data.error) {
        console.warn('QR code error:', data.error, data.details || '');
        // Set an error state but don't show alert
        setError(`QR Code Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error fetching QR code:', err);
      setError('Failed to load QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status?t=' + Date.now());
      if (!response.ok) {
        throw new Error('Failed to fetch WhatsApp status');
      }
      const data = await response.json();
      console.log('Status response:', data); // Debug log
      
      // Always update state, even with build-time data initially
      setStatus(data);
      
      // If we have hasQR true but no QR code, fetch the QR code
      if (data.hasQR && !data.qrCode) {
        fetchQRCode();
      } else if (data.qrCode) {
        setQrCodeImage(data.qrCode);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
      console.error('Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data on the client side
    if (isClient) {
      // Add a small delay to ensure we're fully client-side
      const initialFetchTimer = setTimeout(() => {
        fetchStatus();
        fetchQRCode(); // Always try to fetch the QR code initially
      }, 100);
      
      // Poll for status updates every 5 seconds
      const interval = setInterval(fetchStatus, 5000);
      
      return () => {
        clearTimeout(initialFetchTimer);
        clearInterval(interval);
      };
    }
  }, [isClient]);

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to disconnect from WhatsApp');
      }
      await fetchStatus(); // Refresh status after disconnect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshQR = () => {
    fetchQRCode();
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between sm:mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your WhatsApp connection and preferences</p>
        </div>
      </div>

      <div className="mt-8 max-w-3xl">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">WhatsApp Connection Status</h3>
            
            {!isClient || loading ? (
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Checking connection status...
              </div>
            ) : error ? (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${status?.isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
                  <span className={`text-sm font-medium ${status?.isConnected ? 'text-green-700' : 'text-red-700'}`}>
                    {status?.state || (status?.isConnected ? 'Connected' : 'Disconnected')}
                  </span>
                </div>

                {status?.hasQR && (
                  <div className="mt-6">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <QrCode className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">Scan QR Code to Connect</span>
                        </div>
                      </div>
                      
                      <DirectQRCode />
                      
                      <p className="mt-4 text-sm text-gray-500 text-center">
                        Open WhatsApp on your phone and scan this QR code to connect
                      </p>
                    </div>
                  </div>
                )}

                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={loading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      loading
                        ? 'bg-red-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    }`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Disconnecting...
                      </>
                    ) : (
                      'Disconnect WhatsApp'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 