'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletBalance } from '@/lib/xrpl/wallet';
import { getDonorNFTs, getImpactNFTs } from '@/lib/xrpl/nft';
import DonationImpact from '@/components/donor/DonationImpact';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

      setImpactMap(impactDict);
      setCategoryProportions(weightedCategoryTotals);
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
        <h1 className="text-2xl font-bold mb-4">Donor Dashboard</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Wallet Address</p>
            <p className="font-mono">{userWallet.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Balance</p>
            <p className="font-bold">{balance} XRP</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Donation Receipts</h2>
            <button
              onClick={() => router.push('/donate')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              New Donation
            </button>
          </div>
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : donationNFTs.length === 0 ? (
            <p>No donation receipts found.</p>
          ) : (
            <div className="space-y-4">
              {donationNFTs.map((nft) => {
                try {
                  const metadata = nft.URI ? JSON.parse(nft.URI) : null;
                  return (
                    <div key={nft.NFTokenID} className="border rounded-lg p-4">
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
                      {metadata && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Purpose</p>
                          <p className="text-sm">{metadata.purpose}</p>
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

        <DonationImpact impacts={Object.values(impactMap)} />

        {Object.keys(categoryProportions).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Donation Usage Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(categoryProportions).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {Object.entries(categoryProportions).map(([key], index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}