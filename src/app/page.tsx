'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import NGOList from '@/components/NGOList';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              🌊 Phifi - Web3 Impact Platform
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-indigo-100">
              Transparent, traceable, and impactful donations powered by blockchain technology.
              Support verified NGOs and track your impact in real-time.
            </p>
            <div className="mt-8">
              <button
                onClick={() => router.push('/auth/register')}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NGO Grid Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          🏢 Verified NGOs
        </h2>
        <NGOList />
      </div>
    </div>
  );
}
