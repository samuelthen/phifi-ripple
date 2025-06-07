import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  email: string;
  role: 'donor' | 'ngo';
  wallet_address: string;
  wallet_secret: string;
  created_at: string;
  updated_at: string;
};

export type NGO = {
  id: string;
  name: string;
  description: string;
  wallet_address: string;
  category: 'education' | 'healthcare' | 'environment' | 'humanitarian';
  verified: boolean;
  created_at: string;
  updated_at: string;
};

// Function to get all verified NGOs
export async function getVerifiedNGOs(): Promise<NGO[]> {
  const { data, error } = await supabase
    .from('ngos')
    .select('*')
    .eq('verified', true);

  if (error) throw error;
  return data || [];
}

// Function to get NGO by wallet address
export async function getNGOByWalletAddress(walletAddress: string): Promise<NGO | null> {
  const { data, error } = await supabase
    .from('ngos')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (error) throw error;
  return data;
} 