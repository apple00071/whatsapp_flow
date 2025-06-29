'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';

interface Contact {
  phone: string;
  message: string;
}

export function BulkMessageUpload() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV file. Please check the format.');
          setIsUploading(false);
          return;
        }

        const parsedContacts = results.data.map((row: any) => ({
          phone: row.phone?.toString().trim() || '',
          message: row.message?.toString().trim() || ''
        })).filter(contact => contact.phone && contact.message);

        if (parsedContacts.length === 0) {
          setError('No valid contacts found in the CSV file.');
          setIsUploading(false);
          return;
        }

        setContacts(parsedContacts);
        setProgress({ current: 0, total: parsedContacts.length });
        setIsUploading(false);
      },
      error: (error) => {
        setError(`Error reading file: ${error.message}`);
        setIsUploading(false);
      }
    });
  };

  const handleSendMessages = async () => {
    if (contacts.length === 0) return;

    setIsSending(true);
    setProgress({ current: 0, total: contacts.length });
    setError(null);
    setSuccess(null);

      try {
      // Use the new bulk endpoint instead of sending messages one by one
      const response = await fetch('/api/whatsapp/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({ contacts }),
        });

      const data = await response.json();

        if (!response.ok) {
        throw new Error(data.error || 'Failed to send messages');
      }

      setSuccess(`Successfully queued ${contacts.length} messages. They will be sent gradually to avoid detection.`);
      setProgress({ current: contacts.length, total: contacts.length });
      
      // Clear contacts after successful queueing
      setContacts([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send messages');
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setContacts([]);
    setProgress({ current: 0, total: 0 });
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Upload Contacts</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV file with phone numbers and messages. The file should have columns named "phone" and "message".
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
        >
          Choose CSV File
        <input
            id="file-upload"
            name="file-upload"
          type="file"
          accept=".csv"
            className="sr-only"
            ref={fileInputRef}
          onChange={handleFileUpload}
            disabled={isUploading || isSending}
        />
        </label>
        <span className="text-sm text-gray-500">
          {contacts.length > 0 ? `${contacts.length} contacts loaded` : 'No file chosen'}
        </span>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {contacts.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900">Preview</h4>
          <div className="mt-2 max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.slice(0, 5).map((contact, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{contact.message.length > 50 ? `${contact.message.substring(0, 50)}...` : contact.message}</td>
                  </tr>
                ))}
                {contacts.length > 5 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-sm text-gray-500 text-center">
                      And {contacts.length - 5} more...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {progress.total > 0 && isSending && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress.current} of {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{
                width: `${(progress.current / progress.total) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={handleSendMessages}
          disabled={contacts.length === 0 || isUploading || isSending}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Send Messages'}
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset
        </button>
      </div>
    </div>
  );
} 