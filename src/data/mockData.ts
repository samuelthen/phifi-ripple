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

export const verifiedNGOs: NGO[] = [
  {
    id: 'ngo1',
    name: 'Global Education Initiative',
    description: 'Providing quality education to underprivileged communities worldwide.',
    walletAddress: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
    category: 'education',
  },
  {
    id: 'ngo2',
    name: 'Health for All Foundation',
    description: 'Delivering essential healthcare services to remote communities.',
    walletAddress: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    category: 'healthcare',
  },
  {
    id: 'ngo3',
    name: 'Green Earth Alliance',
    description: 'Environmental conservation and sustainable development projects.',
    walletAddress: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
    category: 'environment',
  },
];

export const recipientWallets: RecipientWallet[] = [
  {
    id: 'vendor1',
    name: 'Local Food Supplier',
    walletAddress: 'rJVUeRqDFNs2xqXA7btWW2BWZkGedMf9PM',
    category: 'food',
  },
  {
    id: 'staff1',
    name: 'Field Operations Team',
    walletAddress: 'r4LqKqQKqQKqQKqQKqQKqQKqQKqQKqQKqQ',
    category: 'wages',
  },
  {
    id: 'logistics1',
    name: 'Transport Services',
    walletAddress: 'r5LqKqQKqQKqQKqQKqQKqQKqQKqQKqQKqQ',
    category: 'transport',
  },
  {
    id: 'supplies1',
    name: 'Medical Supplies Vendor',
    walletAddress: 'r6LqKqQKqQKqQKqQKqQKqQKqQKqQKqQKqQ',
    category: 'supplies',
  },
];

// Mock data for development
export const mockNGOs = [
  {
    id: '1',
    name: 'Education First',
    description: 'Providing quality education to underprivileged children',
    wallet_address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    category: 'education',
    verified: true,
  },
  {
    id: '2',
    name: 'Health Care Plus',
    description: 'Improving healthcare access in rural areas',
    wallet_address: 'r4L5CVaGpL2Lp6Zz7T9Xz3Zz3Zz3Zz3Zz3Z',
    category: 'healthcare',
    verified: true,
  },
];

// Mock recipient wallets for NGO fund disbursement
export const mockRecipients = [
  {
    id: '1',
    name: 'Field Operations Team',
    wallet_address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', // Valid testnet address
    category: 'operations',
  },
  {
    id: '2',
    name: 'Medical Supplies',
    wallet_address: 'r4L5CVaGpL2Lp6Zz7T9Xz3Zz3Zz3Zz3Zz3Z', // Valid testnet address
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