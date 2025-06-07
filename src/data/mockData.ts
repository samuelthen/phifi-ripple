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