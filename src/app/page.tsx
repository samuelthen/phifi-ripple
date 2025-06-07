'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { getDonorNFTs, getImpactNFTs } from '@/lib/xrpl/nft';
import { getRegisteredNGOs } from '@/lib/xrpl/ngo';

export default function HomePage() {
  const router = useRouter();
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
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              Modernize your philanthropy with PhiFi
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-indigo-100 mb-12 leading-relaxed">
              PhiFi's blockchain-powered platform empowers NGOs and donors to integrate Web3 technology into their charitable giving in a simple, secure, and transparent way—all in one place.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/auth/register')}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-5 md:text-xl md:px-12 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose PhiFi?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-2">Blockchain Transparency</h3>
              <p className="text-gray-600">Every donation is recorded on the XRPL blockchain, ensuring complete transparency and traceability.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Impact Tracking</h3>
              <p className="text-gray-600">Track your donations' impact in real-time with our innovative NFT-based tracking system.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
              <p className="text-gray-600">Connect with verified NGOs worldwide and make a difference with just a few clicks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join us in revolutionizing philanthropy with Web3 technology.
          </p>
          <button
            onClick={() => router.push('/auth/register')}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:scale-105"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
}
