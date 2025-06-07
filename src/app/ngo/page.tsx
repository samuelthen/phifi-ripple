'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletBalance, sendXRP } from '@/lib/xrpl/wallet';
import { getDonorNFTs, getImpactNFTs, mintNGOReceipt } from '@/lib/xrpl/nft';
import DonationImpact from '@/components/donor/DonationImpact';

const mockRecipients = [
  {
    id: '1',
    name: 'Field Operations Team',
    wallet_address: 'raYw7HnfnoM5Tu52esPEfzhXkZCiurFiGb',
    category: 'operations',
  },
  {
    id: '2',
    name: 'Medical Supplies',
    wallet_address: 'raYw7HnfnoM5Tu52esPEfzhXkZCiurFiGb',
    category: 'supplies',
  },
  {
    id: '3',
    name: 'Local Community Center',
    wallet_address: 'raYw7HnfnoM5Tu52esPEfzhXkZCiurFiGb',
    category: 'community',
  },
  {
    id: '4',
    name: 'Emergency Response Team',
    wallet_address: 'raYw7HnfnoM5Tu52esPEfzhXkZCiurFiGb',
    category: 'emergency',
  },
];

export default function NgoDashboard() {
  const router = useRouter();
  const [userWallet, setUserWallet] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');
  const [donationNFTs, setDonationNFTs] = useState<any[]>([]);
  const [impactNFTs, setImpactNFTs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedPurpose, setSelectedPurpose] = useState<'food' | 'wages' | 'transport' | 'supplies'>('food');
  const [amount, setAmount] = useState<string>('10');
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState(mockRecipients[0]);

  const loadWalletData = useCallback(async (wallet: any) => {
    try {
      const [walletBalance, receipts, impacts] = await Promise.all([
        getWalletBalance(wallet.address),
        getDonorNFTs(wallet.address),
        getImpactNFTs(wallet.address),
      ]);

      if (walletBalance) setBalance(walletBalance);
      if (receipts) setDonationNFTs(receipts);
      if (impacts) setImpactNFTs(impacts);
      setIsDataLoaded(true);
    } catch (err) {
      console.error('Error loading wallet data:', err);
      setError('Failed to load wallet data');
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
        if (!storedWallet) return router.push('/');

        const wallet = JSON.parse(storedWallet);
        if (wallet.role !== 'ngo') return router.push('/');

        setUserWallet(wallet);
        await loadWalletData(wallet);
      } catch (err) {
        console.error('Error loading wallet:', err);
        setError('Failed to load wallet');
      } finally {
        setIsLoading(false);
      }
    };

    loadWallet();
  }, [router, loadWalletData]);

  const handleSendFunds = async () => {
    if (!userWallet || !amount || parseFloat(amount) <= 0) return;

    if (!userWallet.secret || typeof userWallet.secret !== 'string') {
      alert('Wallet secret is missing. Cannot send transaction.');
      return;
    }

    setSending(true);

    try {
      const txHash = await sendXRP(userWallet.secret, recipient.wallet_address, amount, selectedPurpose);

      await mintNGOReceipt(userWallet.secret, {
        amount,
        purpose: selectedPurpose,
        recipient: recipient.name,
        ngoId: userWallet.username || userWallet.address,
        ngoName: 'Your NGO Name',
        txHash,
        timestamp: Date.now(),
        category: recipient.category,
      });

      alert(`Sent ${amount} XRP to ${recipient.name}. NFT receipt minted.`);
      await loadWalletData(userWallet);
    } catch (err: any) {
      console.error('Error sending funds:', err);
      alert(`Error sending funds:\n${err?.message || JSON.stringify(err)}`);
    } finally {
      setSending(false);
    }
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

  if (!userWallet || !isDataLoaded) return null;

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

          <label className="block mb-2 text-sm font-medium">Select Recipient</label>
          <select
            value={recipient.id}
            onChange={(e) => {
              const selected = mockRecipients.find(r => r.id === e.target.value);
              if (selected) setRecipient(selected);
            }}
            className="mb-4 p-2 border rounded-md w-full"
          >
            {mockRecipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <label className="block mb-2 text-sm font-medium">Select Purpose</label>
          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value as any)}
            className="mb-4 p-2 border rounded-md w-full"
          >
            <option value="food">Food</option>
            <option value="wages">Wages</option>
            <option value="transport">Transport</option>
            <option value="supplies">Supplies</option>
          </select>

          <label className="block mb-2 text-sm font-medium">Enter Amount (XRP)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mb-4 p-2 border rounded-md w-full"
          />

          <button
            onClick={handleSendFunds}
            disabled={sending || !amount || parseFloat(amount) <= 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {sending ? 'Processing...' : `Send ${amount} XRP`}
          </button>
        </div>

        <DonationImpact
          impacts={impactNFTs.map(nft => {
            try {
              const metadata = nft.URI ? JSON.parse(nft.URI) : null;
              return {
                id: nft.NFTokenID,
                donationId: nft.NFTokenID,
                ngoId: metadata?.ngoId || '',
                ngoName: metadata?.recipient || 'Unknown Recipient',
                amount: metadata?.amount || '0',
                category: metadata?.category || 'unknown',
                recipient: metadata?.purpose || 'N/A', // Swapped with purpose
                purpose: metadata?.purpose || 'N/A',
                timestamp: metadata?.timestamp || Date.now(),
                txHash: metadata?.txHash || '',
              };
            } catch {
              return {
                id: nft.NFTokenID,
                donationId: nft.NFTokenID,
                ngoId: '',
                ngoName: 'Unknown Recipient',
                amount: '0',
                category: 'unknown',
                recipient: 'Unknown',
                purpose: 'Unknown',
                timestamp: Date.now(),
                txHash: '',
              };
            }
          })}
        />
      </div>
    </div>
  );
}
