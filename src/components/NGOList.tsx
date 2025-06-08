'use client';

import { useState, useEffect } from 'react';
import { getVerifiedNGOs, NGO } from '@/lib/supabase/client';
import { getDonorNFTs, getImpactNFTs } from '@/lib/xrpl/nft';
import Image from 'next/image';

interface NGOWithDonations extends NGO {
  total_donations?: number;
}

const getCategoryImage = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    education: '/images/categories/education.jpg',
    healthcare: '/images/categories/healthcare.jpg',
    environment: '/images/categories/environment.jpg',
    poverty: '/images/categories/poverty.jpg',
    disaster: '/images/categories/disaster.jpg',
    other: '/images/categories/other.jpg'
  };
  return categoryMap[category.toLowerCase()] || '/images/categories/other.jpg';
};

export default function NGOList() {
  const [ngos, setNGOs] = useState<NGOWithDonations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadNGOs = async () => {
      try {
        const verifiedNGOs = await getVerifiedNGOs();
        
        // Calculate total donations for each NGO
        const ngosWithDonations = await Promise.all(
          verifiedNGOs.map(async (ngo) => {
            // Get both donor and impact NFTs
            const [donorNFTs, impactNFTs] = await Promise.all([
              getDonorNFTs(ngo.wallet_address),
              getImpactNFTs(ngo.wallet_address)
            ]);

            // Calculate total from donor NFTs
            const donorTotal = donorNFTs.reduce((sum, nft) => {
              try {
                const metadata = nft.URI ? JSON.parse(nft.URI) : null;
                if (metadata?.amount) {
                  const amount = parseFloat(metadata.amount);
                  return sum + (isNaN(amount) ? 0 : amount);
                }
                return sum;
              } catch (e) {
                console.warn('Error parsing donor NFT metadata:', e);
                return sum;
              }
            }, 0);

            // Calculate total from impact NFTs
            const impactTotal = impactNFTs.reduce((sum, nft) => {
              try {
                const metadata = nft.URI ? JSON.parse(nft.URI) : null;
                if (metadata?.amount) {
                  const amount = parseFloat(metadata.amount);
                  return sum + (isNaN(amount) ? 0 : amount);
                }
                return sum;
              } catch (e) {
                console.warn('Error parsing impact NFT metadata:', e);
                return sum;
              }
            }, 0);

            // Combine both totals
            const totalDonations = donorTotal + impactTotal;

            return {
              ...ngo,
              total_donations: totalDonations
            };
          })
        );

        setNGOs(ngosWithDonations);
      } catch (error) {
        console.error('Error loading NGOs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNGOs();
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

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
        <p className="text-gray-500">No verified NGOs available.</p>
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
          <div className="relative w-full h-48">
            <Image
              src={`/${ngo.category}.jpg`}
              alt={`${ngo.name} - ${ngo.category}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-semibold text-white mb-1">
                {ngo.name}
              </h3>
              <p className="text-white/90 text-sm">
                {ngo.category.charAt(0).toUpperCase() + ngo.category.slice(1)}
              </p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {ngo.description}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Donations</span>
                <span className="font-medium">{ngo.total_donations?.toFixed(2) || '0.00'} XRP</span>
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