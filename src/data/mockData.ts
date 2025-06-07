export type NGO = {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  category: 'education' | 'healthcare' | 'environment' | 'humanitarian';
};

export type RecipientWallet = {
  id: string;
  name: string;
  walletAddress: string;
  category: 'food' | 'wages' | 'transport' | 'supplies';
};

// Mock recipient wallets for NGO fund disbursement
export const mockRecipients = [
  {
    id: '1',
    name: 'Field Operations Team',
    wallet_address: 'raYw7HnfnoM5Tu52esPEfzhXkZCiurFiGb', // Valid testnet address
    category: 'operations',
  },
  {
    id: '2',
    name: 'Medical Supplies',
    wallet_address: 'raYw7HnfnoM5Tu52esPEfzhXkZCiurFiGb', // Valid testnet address
    category: 'supplies',
  },
  {
    id: '3',
    name: 'Local Community Center',
    wallet_address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', // Valid testnet address
    category: 'community',
  },
  {
    id: '4',
    name: 'Emergency Response Team',
    wallet_address: 'r4L5CVaGpL2Lp6Zz7T9Xz3Zz3Zz3Zz3Zz3Z', // Valid testnet address
    category: 'emergency',
  },
];

// Mock transaction categories
export const transactionCategories = [
  { id: 'food', name: 'Food' },
  { id: 'wages', name: 'Wages' },
  { id: 'transport', name: 'Transport' },
  { id: 'supplies', name: 'Supplies' },
  { id: 'operations', name: 'Operations' },
  { id: 'emergency', name: 'Emergency' },
  { id: 'community', name: 'Community' },
];

export type DonationImpact = {
  id: string;
  donationId: string;
  ngoId: string;
  ngoName: string;
  amount: string;
  category: string;
  recipient: string;
  timestamp: number;
  txHash: string;
};

// Mock donation impact data
export const mockDonationImpacts: DonationImpact[] = [
  {
    id: '1',
    donationId: 'don1',
    ngoId: 'ngo1',
    ngoName: 'Global Education Initiative',
    amount: '100',
    category: 'education',
    recipient: 'Local School',
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    txHash: 'tx1',
  },
  {
    id: '2',
    donationId: 'don2',
    ngoId: 'ngo2',
    ngoName: 'Health for All Foundation',
    amount: '50',
    category: 'healthcare',
    recipient: 'Medical Supplies',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    txHash: 'tx2',
  },
]; 