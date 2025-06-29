'use client';

import { BulkMessageUpload } from '@/components/BulkMessageUpload';

export default function BulkPage() {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between sm:mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bulk Messages</h1>
          <p className="mt-2 text-sm text-gray-600">Send messages to multiple contacts at once</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <BulkMessageUpload />
        </div>
      </div>
    </div>
  );
} 