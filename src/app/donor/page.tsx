'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getNFTs } from '@/lib/xrpl/nft';
import { getWalletBalance } from '@/lib/xrpl/wallet';
import { verifiedNGOs } from '@/data/mockData';

export default function DonorDashboard() {
  const router = useRouter();
  const [userWallet, setUserWallet] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');
  const [nfts, setNfts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedWallet = localStorage.getItem('userWallet');
    if (!storedWallet) {
      router.push('/');
      return;
    }

    const wallet = JSON.parse(storedWallet);
    if (wallet.role !== 'donor') {
      router.push('/');
      return;
    }

    setUserWallet(wallet);
    loadWalletData(wallet.address);
  }, [router]);

  const loadWalletData = async (address: string) => {
    try {
      const [walletBalance, walletNfts] = await Promise.all([
        getWalletBalance(address),
        getNFTs(address),
      ]);

      setBalance(walletBalance);
      setNfts(walletNfts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewDonation = () => {
    router.push('/donate');
  };

  if (!userWallet) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome, {userWallet.username}
            </p>
          </div>
          <button
            onClick={handleNewDonation}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Donation
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Wallet Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="mt-1 text-sm text-gray-900 break-all">{userWallet.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Balance</p>
              <p className="mt-1 text-sm text-gray-900">{balance} XRP</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Donation Receipts</h2>
          {isLoading ? (
            <p className="text-gray-500">Loading receipts...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : nfts.length === 0 ? (
            <p className="text-gray-500">No donation receipts found.</p>
          ) : (
            <div className="space-y-4">
              {nfts.map((nft) => {
                const metadata = JSON.parse(Buffer.from(nft.URI, 'hex').toString());
                const ngo = verifiedNGOs.find(n => n.id === metadata.ngoId);
                
                return (
                  <div key={nft.NFTokenID} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">NGO</p>
                        <p className="mt-1 text-sm text-gray-900">{ngo?.name || 'Unknown NGO'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Amount</p>
                        <p className="mt-1 text-sm text-gray-900">{metadata.amount} XRP</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Purpose</p>
                        <p className="mt-1 text-sm text-gray-900">{metadata.purpose}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(metadata.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 