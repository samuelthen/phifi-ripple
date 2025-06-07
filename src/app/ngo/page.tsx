'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletBalance, sendXRP } from '@/lib/xrpl/wallet';
import { generateXrplDid } from '@/lib/xrpl/did';
import { recipientWallets } from '@/data/mockData';

export default function NGODashboard() {
  const router = useRouter();
  const [userWallet, setUserWallet] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');
  const [did, setDid] = useState<string>('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'food' | 'wages' | 'transport' | 'supplies'>('food');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    setDid(generateXrplDid(wallet.address));
    loadWalletData(wallet.address);
  }, [router]);

  const loadWalletData = async (address: string) => {
    try {
      const walletBalance = await getWalletBalance(address);
      setBalance(walletBalance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      if (!userWallet) {
        throw new Error('Wallet not found');
      }

      const recipient = recipientWallets.find(r => r.id === selectedRecipient);
      if (!recipient) {
        throw new Error('Selected recipient not found');
      }

      // Send XRP to recipient
      await sendXRP(
        userWallet.secret,
        recipient.walletAddress,
        amount,
        `Category: ${category}`
      );

      // Reload wallet balance
      await loadWalletData(userWallet.address);

      // Reset form
      setSelectedRecipient('');
      setAmount('');
      setCategory('food');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send funds');
    } finally {
      setIsSending(false);
    }
  };

  if (!userWallet) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome, {userWallet.username}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Wallet Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="mt-1 text-sm text-gray-900 break-all">{userWallet.address}</p>
              <p className="mt-2 text-sm font-medium text-gray-500">DID</p>
              <p className="mt-1 text-sm text-gray-900 break-all">{did}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Balance</p>
              <p className="mt-1 text-sm text-gray-900">{balance} XRP</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Send Funds</h2>
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
                {recipientWallets.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.name}
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
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="food">Food</option>
                <option value="wages">Wages</option>
                <option value="transport">Transport</option>
                <option value="supplies">Supplies</option>
              </select>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send Funds'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
} 