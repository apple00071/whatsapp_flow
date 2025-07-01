'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface DirectQRCodeProps {
  onSuccess?: () => void;
}

export function DirectQRCode({ onSuccess }: DirectQRCodeProps) {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHttps, setIsHttps] = useState(false);
  
  useEffect(() => {
    // Check if we're in a browser and if we're using HTTPS
    if (typeof window !== 'undefined') {
      setIsHttps(window.location.protocol === 'https:');
    }
  }, []);
  
  const fetchQrCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching QR code directly from QR API server...');
      
      // Use HTTPS if we're on an HTTPS page to avoid mixed content warnings
      // Note: This will likely fail unless the API server has a valid SSL certificate
      const protocol = isHttps ? 'https://' : 'http://';
      const apiUrl = `${protocol}34.59.26.51:3003/api/whatsapp/qr?t=${Date.now()}`;
      
      console.log('Fetching QR code from:', apiUrl);
      
      // Fetch directly from the QR API server
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        // Use cache: 'no-store' to prevent caching
        cache: 'no-store'
      });
      
      console.log('Direct QR response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`QR API server returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Direct QR response:', data);
      
      if (data.success && data.qrCode) {
        setQrCodeImage(data.qrCode);
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || 'Failed to get QR code');
      }
    } catch (err) {
      console.error('Error fetching QR code directly:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch QR code');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch QR code on component mount if we're not using HTTPS
  useEffect(() => {
    if (!isHttps) {
      fetchQrCode();
      
      // Set up interval to refresh QR code every 30 seconds
      const interval = setInterval(fetchQrCode, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isHttps]);
  
  if (isHttps) {
    return (
      <div className="p-6 border-2 border-orange-300 bg-orange-50 rounded-lg max-w-md mx-auto text-center">
        <h3 className="text-lg font-medium text-orange-800 mb-2">HTTPS Access Restriction</h3>
        <p className="text-sm text-orange-700 mb-4">
          The QR code cannot be loaded directly due to browser security restrictions (Mixed Content Blocking).
        </p>
        <p className="text-sm text-orange-700 mb-4">
          To scan the QR code, please access this app using HTTP instead of HTTPS:
        </p>
        <a 
          href={`http://${window.location.host}${window.location.pathname}`}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 inline-block"
        >
          Switch to HTTP
        </a>
        <p className="text-xs text-orange-600 mt-4">
          Alternatively, you can directly access the QR code at: 
          <a 
            href="http://34.59.26.51:3003/api/whatsapp/qr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline ml-1"
          >
            http://34.59.26.51:3003/api/whatsapp/qr
          </a>
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      {loading ? (
        <div className="h-64 w-64 flex items-center justify-center">
          <RefreshCw className="h-10 w-10 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="h-64 w-64 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md">
          <div className="text-center p-4">
            <p className="text-red-500 mb-2">{error}</p>
            <button 
              onClick={fetchQrCode}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      ) : qrCodeImage ? (
        <div className="relative">
          <img
            src={qrCodeImage}
            alt="WhatsApp QR Code"
            className="h-64 w-64"
          />
          <button 
            onClick={fetchQrCode} 
            className="absolute top-2 right-2 p-1 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100"
            title="Refresh QR Code"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      ) : (
        <div className="h-64 w-64 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md">
          <span className="text-gray-500">No QR code available</span>
        </div>
      )}
    </div>
  );
} 