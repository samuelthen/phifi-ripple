'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletBalance } from '@/lib/xrpl/wallet';
import { getDonorNFTs, getImpactNFTs } from '@/lib/xrpl/nft';
import DonationImpact from '@/components/donor/DonationImpact';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#8dd1e1', '#a4de6c'];

interface ImpactData {
  id: string;
  donationId: string;
  ngoId: string;
  ngoName: string;
  amount: string;
  category: string;
  recipient: string;
  timestamp: number;
  txHash: string;
}

export default function DonorDashboard() {
  const router = useRouter();
  const [userWallet, setUserWallet] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');
  const [donationNFTs, setDonationNFTs] = useState<any[]>([]);
  const [impactNFTs, setImpactNFTs] = useState<any[]>([]);
  const [categoryProportions, setCategoryProportions] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const loadWalletData = useCallback(async (wallet: any) => {
    try {
      const [walletBalance, receipts] = await Promise.all([
        getWalletBalance(wallet.address),
        getDonorNFTs(wallet.address),
      ]);

      if (walletBalance) setBalance(walletBalance);
      setDonationNFTs(receipts);

      const ngoIdToName: Record<string, string> = {};
      const donationTotals: Record<string, number> = {};

      for (const nft of receipts) {
        try {
          const metadata = nft.URI ? JSON.parse(nft.URI) : null;
          if (metadata?.ngoId && metadata?.ngoName) {
            ngoIdToName[metadata.ngoId] = metadata.ngoName;
            const amount = parseFloat(metadata.amount);
            if (!isNaN(amount)) {
              donationTotals[metadata.ngoId] = (donationTotals[metadata.ngoId] || 0) + amount;
            }
          }
        } catch (err) {
          console.warn('Invalid NFT metadata for receipt', nft, err);
        }
      }

      const impactDict: Record<string, any> = {};
      const impactCategoryTotals: Record<string, Record<string, number>> = {};

      await Promise.all(
        Object.entries(ngoIdToName).map(async ([ngoId, ngoName]) => {
          const impacts = await getImpactNFTs(ngoId);
          for (const nft of impacts) {
            try {
              const metadata = nft.URI ? JSON.parse(nft.URI) : null;
              if (metadata) {
                const category = metadata.category || 'unknown';
                const amount = parseFloat(metadata.amount) || 0;

                impactDict[nft.NFTokenID] = {
                  id: nft.NFTokenID,
                  donationId: nft.NFTokenID,
                  ngoId: metadata.ngoId || '',
                  ngoName: ngoName,
                  amount: metadata.amount || '0',
                  category,
                  recipient: metadata.purpose || 'Unknown',
                  purpose: metadata.purpose || 'N/A',
                  timestamp: metadata.timestamp || Date.now(),
                  txHash: metadata.txHash || '',
                };

                if (!impactCategoryTotals[ngoId]) {
                  impactCategoryTotals[ngoId] = {};
                }
                impactCategoryTotals[ngoId][category] = (impactCategoryTotals[ngoId][category] || 0) + amount;
              }
            } catch {
              impactDict[nft.NFTokenID] = {
                id: nft.NFTokenID,
                donationId: nft.NFTokenID,
                ngoId: '',
                ngoName: 'Unknown NGO',
                amount: '0',
                category: 'unknown',
                recipient: 'Unknown',
                purpose: 'Unknown',
                timestamp: Date.now(),
                txHash: '',
              };
            }
          }
        })
      );

      const totalDonation = Object.values(donationTotals).reduce((sum, val) => sum + val, 0);
      const weightedCategoryTotals: Record<string, number> = {};

      for (const [ngoId, categories] of Object.entries(impactCategoryTotals)) {
        const weight = (donationTotals[ngoId] || 0) / totalDonation;
        for (const [category, amount] of Object.entries(categories)) {
          weightedCategoryTotals[category] = (weightedCategoryTotals[category] || 0) + amount * weight;
        }
      }

      // Calculate percentages
      const totalWeightedAmount = Object.values(weightedCategoryTotals).reduce((sum, val) => sum + val, 0);
      const categoryPercentages: Record<string, number> = {};
      
      for (const [category, amount] of Object.entries(weightedCategoryTotals)) {
        categoryPercentages[category] = (amount / totalWeightedAmount) * 100;
      }

      setImpactNFTs(Object.values(impactDict));
      setCategoryProportions(categoryPercentages);
      setIsDataLoaded(true);
    } catch (err) {
      console.error('Error loading wallet data:', err);
      setError('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const storedWallet = localStorage.getItem('userWallet');
        if (!storedWallet) return router.push('/');

        const wallet = JSON.parse(storedWallet);
        if (wallet.role !== 'donor') return router.push('/');

        setUserWallet(wallet);
        await loadWalletData(wallet);
      } catch (err) {
        console.error('Error loading wallet:', err);
        setError('Failed to load wallet');
      }
    };

    loadWallet();
  }, [router, loadWalletData]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-center">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userWallet || !isDataLoaded) return null;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Donor Dashboard</h1>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Wallet Address</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">{userWallet.address}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Balance</p>
            <p className="text-2xl font-bold text-indigo-600">{balance} XRP</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Donation Receipts</h2>
            <button
              onClick={() => router.push('/donate')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
            >
              <span>New Donation</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          ) : donationNFTs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No donation receipts found.</p>
              <p className="text-sm mt-2">Make your first donation to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donationNFTs.map((nft) => {
                try {
                  const metadata = nft.URI ? JSON.parse(nft.URI) : null;
                  return (
                    <div key={nft.NFTokenID} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{metadata?.ngoName || 'Unknown NGO'}</h3>
                          <p className="text-sm text-gray-500">
                            {metadata ? new Date(metadata.timestamp).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {metadata ? `${metadata.amount} XRP` : 'Unknown amount'}
                        </span>
                      </div>
                      {metadata && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-600">Purpose</p>
                          <p className="text-sm text-gray-700 mt-1">{metadata.purpose}</p>
                        </div>
                      )}
                    </div>
                  );
                } catch {
                  return null;
                }
              })}
            </div>
          )}
        </div>

        <DonationImpact
          impacts={impactNFTs.map(nft => {
            try {
              const metadata = nft.URI ? JSON.parse(nft.URI) : null;
              const impact: ImpactData = {
                id: nft.NFTokenID,
                donationId: nft.NFTokenID,
                ngoId: metadata?.wallet_address || metadata?.ngoId || '',
                ngoName: metadata?.ngoName || 'Unknown NGO',
                amount: metadata?.amount || '0',
                category: metadata?.category || 'unknown',
                recipient: metadata?.purpose || 'Unknown',
                timestamp: metadata?.timestamp || Date.now(),
                txHash: metadata?.txHash || '',
              };
              return impact;
            } catch {
              return null;
            }
          }).filter((impact): impact is ImpactData => impact !== null)}
        />

        {Object.keys(categoryProportions).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Donation Impact by Category</h2>
            <div className="space-y-3 mb-6">
              {Object.entries(categoryProportions).map(([name, value]) => (
                <div key={name} className="flex justify-between items-center border-b border-gray-100 py-2">
                  <span className="capitalize font-medium text-gray-700">{name}</span>
                  <span className="font-mono bg-gray-50 px-3 py-1 rounded text-gray-800">{value.toFixed(2)}%</span>
                </div>
              ))}
            </div>

            <div className="mt-6" style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={Object.entries(categoryProportions).map(([name, value]) => ({ name, value }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {Object.entries(categoryProportions).map(([key], index) => (
                      <Cell key={`cell-${key}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      padding: '0.5rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}