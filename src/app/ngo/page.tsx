'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletBalance, sendXRP } from '@/lib/xrpl/wallet';
import { mintImpactNFT, getImpactNFTs } from '@/lib/xrpl/nft';
import { mockRecipients, transactionCategories } from '@/data/mockData';

export default function NGODashboard() {
  const router = useRouter();
  const [userWallet, setUserWallet] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [impactNFTs, setImpactNFTs] = useState<any[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const loadWalletData = useCallback(async (wallet: any) => {
    try {
      const [walletBalance, nfts] = await Promise.all([
        getWalletBalance(wallet.address),
        getImpactNFTs(wallet.address),
      ]);

      if (walletBalance) setBalance(walletBalance);
      if (nfts) setImpactNFTs(nfts);
      setIsDataLoaded(true);
    } catch (err) {
      console.error('Error loading wallet data:', err);
      setError('Failed to load wallet data');
      // Retry logic
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadWalletData(wallet);
        }, 2000);
      }
    }
  }, [retryCount]);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const storedWallet = localStorage.getItem('userWallet');
        if (!storedWallet) {
          router.push('/');
          return;
        }

        const wallet = JSON.parse(storedWallet);
        if (wallet.role !== 'ngo') {
          router.push('/');
          return;
        }

        setUserWallet(wallet);
        await loadWalletData(wallet);
      } catch (err) {
        console.error('Error loading wallet:', err);
        setError('Failed to load wallet data');
      } finally {
        setIsLoading(false);
      }
    };

    loadWallet();
  }, [router, loadWalletData]);

  // Refresh data periodically
  useEffect(() => {
    if (!userWallet || !isDataLoaded) return;

    const interval = setInterval(async () => {
      await loadWalletData(userWallet);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [userWallet, isDataLoaded, loadWalletData]);

  const handleSendFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!userWallet) {
        throw new Error('Wallet not found');
      }

      const recipient = mockRecipients.find(r => r.id === selectedRecipient);
      if (!recipient) {
        throw new Error('Selected recipient not found');
      }

      // Send XRP to recipient
      const txHash = await sendXRP(
        userWallet.secret,
        recipient.wallet_address,
        amount,
        `Funds for ${category} - ${recipient.name}`
      );

      // Mint impact NFT
      await mintImpactNFT(userWallet.secret, {
        amount,
        category,
        recipient: recipient.name,
        txHash,
        timestamp: Date.now(),
        impactWindow: 12 * 30 * 24 * 60 * 60 * 1000, // 12 months
        purpose: `Funds for ${category} - ${recipient.name}`,
      });

      // Update wallet data
      await loadWalletData(userWallet);
      
      setSuccess(`Successfully sent ${amount} XRP to ${recipient.name}`);
      setSelectedRecipient('');
      setAmount('');
      setCategory('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send funds');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      education: 'bg-blue-100 text-blue-800',
      healthcare: 'bg-green-100 text-green-800',
      environment: 'bg-emerald-100 text-emerald-800',
      humanitarian: 'bg-purple-100 text-purple-800',
      food: 'bg-orange-100 text-orange-800',
      wages: 'bg-yellow-100 text-yellow-800',
      transport: 'bg-indigo-100 text-indigo-800',
      supplies: 'bg-pink-100 text-pink-800',
      operations: 'bg-gray-100 text-gray-800',
      emergency: 'bg-red-100 text-red-800',
      community: 'bg-teal-100 text-teal-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-center">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userWallet || !isDataLoaded) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">NGO Dashboard</h1>
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
          <h2 className="text-xl font-bold mb-4">Send Funds</h2>
          <form onSubmit={handleSendFunds} className="space-y-4">
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                Select Recipient
              </label>
              <select
                id="recipient"
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select a recipient</option>
                {mockRecipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.name} - {recipient.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (XRP)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="1"
                step="0.1"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select a category</option>
                {transactionCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {success && (
              <div className="text-green-600 text-sm">{success}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Send Funds'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Fund Disbursement History</h2>
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : impactNFTs.length === 0 ? (
            <p>No fund disbursements found.</p>
          ) : (
            <div className="space-y-4">
              {impactNFTs.map((nft) => {
                try {
                  const metadata = nft.URI ? JSON.parse(nft.URI) : null;
                  return (
                    <div key={nft.NFTokenID} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{metadata?.recipient || 'Unknown Recipient'}</h3>
                          <p className="text-sm text-gray-600">
                            {metadata ? new Date(metadata.timestamp).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(metadata?.category || '')}`}>
                          {metadata?.category || 'Unknown'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-medium">{metadata?.amount || '0'} XRP</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Purpose</p>
                          <p className="font-medium">{metadata?.purpose || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Transaction</p>
                        <p className="font-mono text-xs break-all">{metadata?.txHash || 'Unknown'}</p>
                      </div>
                    </div>
                  );
                } catch (err) {
                  console.error('Error parsing NFT metadata:', err);
                  return null;
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 