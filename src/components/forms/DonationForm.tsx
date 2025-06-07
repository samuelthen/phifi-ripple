'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendXRP } from '@/lib/xrpl/wallet';
import { mintDonationReceipt } from '@/lib/xrpl/nft';
import { getVerifiedNGOs, NGO } from '@/lib/supabase/client';

export default function DonationForm() {
  const router = useRouter();
  const [selectedNGO, setSelectedNGO] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userWallet, setUserWallet] = useState<any>(null);
  const [ngos, setNGOs] = useState<NGO[]>([]);

  useEffect(() => {
    const storedWallet = localStorage.getItem('userWallet');
    if (!storedWallet) {
      router.push('/');
      return;
    }
    setUserWallet(JSON.parse(storedWallet));
    loadNGOs();
  }, [router]);

  const loadNGOs = async () => {
    try {
      const verifiedNGOs = await getVerifiedNGOs();
      setNGOs(verifiedNGOs);
    } catch (err) {
      setError('Failed to load NGOs');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!userWallet) {
        throw new Error('Wallet not found');
      }

      const ngo = ngos.find(n => n.id === selectedNGO);
      if (!ngo) {
        throw new Error('Selected NGO not found');
      }

      // Send XRP to NGO
      const txHash = await sendXRP(
        userWallet.secret,
        ngo.wallet_address,
        amount,
        purpose
      );

      // Mint NFT receipt
      await mintDonationReceipt(userWallet.secret, {
        amount,
        ngoId: ngo.id,
        ngoName: ngo.name,
        purpose,
        txHash,
        timestamp: Date.now(),
        impactWindow: 12 * 30 * 24 * 60 * 60 * 1000, // 12 months in milliseconds
      });

      // Redirect to donor dashboard
      router.push('/donor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process donation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userWallet) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Make a Donation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ngo" className="block text-sm font-medium text-gray-700">
            Select NGO
          </label>
          <select
            id="ngo"
            value={selectedNGO}
            onChange={(e) => setSelectedNGO(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select an NGO</option>
            {ngos.map((ngo) => (
              <option key={ngo.id} value={ngo.id}>
                {ngo.name} - {ngo.category}
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
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
            Purpose
          </label>
          <textarea
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Make Donation'}
        </button>
      </form>
    </div>
  );
} 