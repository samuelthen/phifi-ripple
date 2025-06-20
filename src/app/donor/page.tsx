'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletBalance } from '@/lib/xrpl/wallet';
import { getDonorNFTs, getImpactNFTs } from '@/lib/xrpl/nft';
import DonationImpact from '@/components/donor/DonationImpact';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '@/components/Navbar';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#8dd1e1', '#a4de6c'];

export default function DonorDashboard() {
  const router = useRouter();
  const [userWallet, setUserWallet] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');
  const [donationNFTs, setDonationNFTs] = useState<any[]>([]);
  const [impactMap, setImpactMap] = useState<Record<string, any>>({});
  const [categoryProportions, setCategoryProportions] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const loadWalletData = useCallback(async (wallet: any) => {
    console.log('[loadWalletData] Starting data load for wallet:', wallet.address);
    try {
      const [walletBalance, receipts] = await Promise.all([
        getWalletBalance(wallet.address),
        getDonorNFTs(wallet.address),
      ]);

      console.log('[loadWalletData] Initial data loaded:', {
        balance: walletBalance,
        receiptCount: receipts.length
      });

      if (walletBalance) setBalance(walletBalance);
      setDonationNFTs(receipts);

      const ngoIdToName: Record<string, string> = {};
      const donationTotals: Record<string, number> = {};

      for (const nft of receipts) {
        try {
          const metadata = nft.URI ? JSON.parse(nft.URI) : null;
          console.log('[loadWalletData] Processing donation NFT:', {
            nftId: nft.NFTokenID,
            metadata
          });

          if (metadata?.ngoId && metadata?.ngoName) {
            ngoIdToName[metadata.ngoId] = metadata.ngoName;
            const amount = parseFloat(metadata.amount);
            if (!isNaN(amount)) {
              donationTotals[metadata.ngoId] = (donationTotals[metadata.ngoId] || 0) + amount;
            }
          }
        } catch (err) {
          console.warn('[loadWalletData] Failed to process donation NFT:', {
            nftId: nft.NFTokenID,
            error: err
          });
        }
      }

      console.log('[loadWalletData] Processed donations:', {
        ngoCount: Object.keys(ngoIdToName).length,
        donationTotals
      });

      const impactDict: Record<string, any> = {};
      const impactCategoryTotals: Record<string, Record<string, number>> = {};

      await Promise.all(
        Object.entries(ngoIdToName).map(async ([ngoId, ngoName]) => {
          console.log('[loadWalletData] Fetching impact NFTs for NGO:', {
            ngoId,
            ngoName
          });

          const impacts = await getImpactNFTs(ngoId);
          console.log('[loadWalletData] Impact NFTs fetched:', {
            ngoId,
            impactCount: impacts.length
          });

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
                  ngoName,
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
            } catch (err) {
              console.warn('[loadWalletData] Failed to process impact NFT:', {
                nftId: nft.NFTokenID,
                error: err
              });
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

      console.log('[loadWalletData] Processed impact data:', {
        impactCount: Object.keys(impactDict).length,
        categoryTotals: impactCategoryTotals
      });

      const totalDonation = Object.values(donationTotals).reduce((sum, val) => sum + val, 0);
      const weightedCategoryTotals: Record<string, number> = {};

      for (const [ngoId, categories] of Object.entries(impactCategoryTotals)) {
        const weight = (donationTotals[ngoId] || 0) / totalDonation;
        for (const [category, amount] of Object.entries(categories)) {
          weightedCategoryTotals[category] = (weightedCategoryTotals[category] || 0) + amount * weight;
        }
      }

      console.log('[loadWalletData] Calculated weighted totals:', weightedCategoryTotals);

      const totalWeightedAmount = Object.values(weightedCategoryTotals).reduce((sum, val) => sum + val, 0);
      const categoryPercentages: Record<string, number> = {};
      for (const [category, amount] of Object.entries(weightedCategoryTotals)) {
        categoryPercentages[category] = (amount / totalWeightedAmount) * 100;
      }

      console.log('[loadWalletData] Final category proportions:', categoryPercentages);

      setImpactMap(impactDict);
      setCategoryProportions(categoryPercentages);
      setIsDataLoaded(true);
    } catch (err) {
      console.error('[loadWalletData] Failed to load wallet data:', err);
      setError('Failed to load wallet data');
    } finally {
      setIsLoading(false);
      console.log('[loadWalletData] Data loading completed');
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto mt-8 p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-center">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userWallet || !isDataLoaded) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto mt-8 p-4 sm:p-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Impact Analytics */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4">✨ Impact Analytics Dashboard</h2>
            {Object.keys(categoryProportions).length > 0 ? (
              <>
                <div className="space-y-2 mb-4">
                  {Object.entries(categoryProportions).map(([name, value]) => (
                    <div key={name} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-700">{name}</span>
                      <span className="font-mono">{value.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4" style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={Object.entries(categoryProportions).map(([name, value]) => ({ name, value }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name.charAt(0).toUpperCase() + name.slice(1)} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {Object.entries(categoryProportions).map(([_, __], index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `${value.toFixed(2)}%`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          padding: '0.5rem',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">No donation data yet.</div>
            )}
          </div>

          {/* Wallet Info */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h1 className="text-2xl font-bold mb-4">🌐 Web3 Donor Portal</h1>
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-gray-600">Your Wallet Address</p>
                <p className="font-mono text-sm break-all">{userWallet.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">XRP Balance</p>
                <p className="text-xl font-bold">{balance} XRP</p>
              </div>
              <button
                onClick={() => router.push('/donate')}
                className="mt-4 w-full bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 transition-colors"
              >
                🎯 New Impact Donation
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Impact Tracker */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4">🌟 Real-Time Impact Tracker</h2>
            <div className="max-h-[500px] overflow-y-auto">
              <DonationImpact impacts={Object.values(impactMap).sort((a, b) => b.timestamp - a.timestamp)} />
            </div>
          </div>

          {/* Donation Receipts */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4">📜 On-Chain Donation History</h2>
            {error ? (
              <p className="text-red-600">{error}</p>
            ) : donationNFTs.length === 0 ? (
              <p className="text-gray-500">No donation receipts found.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {[...donationNFTs]
                  .sort((a, b) => {
                    const dateA = a.URI ? JSON.parse(a.URI)?.timestamp || 0 : 0;
                    const dateB = b.URI ? JSON.parse(b.URI)?.timestamp || 0 : 0;
                    return dateB - dateA;
                  })
                  .map((nft) => {
                    try {
                      const metadata = nft.URI ? JSON.parse(nft.URI) : null;
                      return (
                        <div key={nft.NFTokenID} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{metadata?.ngoName || 'Unknown NGO'}</h3>
                              <p className="text-sm text-gray-600">
                                {metadata ? new Date(metadata.timestamp).toLocaleDateString() : 'Unknown date'}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {metadata ? `${metadata.amount} XRP` : 'Unknown amount'}
                            </span>
                          </div>
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800">
                              View Details
                            </summary>
                            {metadata && (
                              <div className="mt-2 pl-4 border-l-2 border-indigo-200">
                                <div className="mt-1">
                                  <p className="text-sm text-gray-600">Purpose</p>
                                  <p className="text-sm">{metadata.purpose}</p>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600">Category</p>
                                  <p className="text-sm">{metadata.category}</p>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600">Transaction</p>
                                  <p className="font-mono text-xs break-all">{metadata.txHash}</p>
                                </div>
                              </div>
                            )}
                          </details>
                        </div>
                      );
                    } catch (err) {
                      console.error('Error parsing NFT metadata:', err, 'NFT:', nft);
                      return null;
                    }
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
