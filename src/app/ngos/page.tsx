'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import NGOList from '@/components/NGOList';

export default function NGOsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* NGO Grid Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🏢 Verified NGOs
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Support our verified NGOs and track your impact in real-time. Each donation is recorded on the blockchain for complete transparency.
          </p>
        </div>
        <NGOList />
      </div>
    </div>
  );
} 