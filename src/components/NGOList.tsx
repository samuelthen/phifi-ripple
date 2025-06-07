'use client';

import { useState, useEffect } from 'react';
import { getRegisteredNGOs } from '@/lib/xrpl/ngo';

interface NGO {
  id: string;
  name: string;
  wallet_address: string;
  description: string;
  created_at: string;
  total_donations?: number;
  total_projects?: number;
}

export default function NGOList() {
  const [ngos, setNGOs] = useState<NGO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNGOs = async () => {
      try {
        const registeredNGOs = await getRegisteredNGOs();
        setNGOs(registeredNGOs);
      } catch (error) {
        console.error('Error loading NGOs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNGOs();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading NGOs...</p>
      </div>
    );
  }

  if (ngos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No NGOs registered yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {ngos.map((ngo) => (
        <div
          key={ngo.id}
          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {ngo.name}
            </h3>
            <p className="text-gray-500 text-sm mb-4 break-all">
              {ngo.wallet_address}
            </p>
            <p className="text-gray-600 text-sm mb-4">
              {ngo.description}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Donations</span>
                <span className="font-medium">{ngo.total_donations || 0} XRP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Impact Projects</span>
                <span className="font-medium">{ngo.total_projects || 0}</span>
              </div>
            </div>
            <button
              onClick={() => window.location.href = `/donate?ngo=${ngo.wallet_address}`}
              className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Donate Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 