'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { createTestnetWallet } from '@/lib/xrpl/wallet';

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'donor' | 'ngo'>('donor');
  const [ngoName, setNgoName] = useState('');
  const [ngoDescription, setNgoDescription] = useState('');
  const [ngoCategory, setNgoCategory] = useState<'education' | 'healthcare' | 'environment' | 'humanitarian'>('education');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Create XRPL wallet
          const wallet = await createTestnetWallet(email, role);

          // Store wallet info in Supabase
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              role,
              wallet_address: wallet.address,
              wallet_secret: wallet.secret,
            });

          if (profileError) throw profileError;

          // If NGO, create NGO profile
          if (role === 'ngo') {
            const { error: ngoError } = await supabase
              .from('ngos')
              .insert({
                id: authData.user.id,
                name: ngoName,
                description: ngoDescription,
                wallet_address: wallet.address,
                category: ngoCategory,
                verified: false, // NGOs need to be verified by admin
              });

            if (ngoError) throw ngoError;
          }

          // Store wallet info in localStorage for immediate use
          localStorage.setItem('userWallet', JSON.stringify(wallet));
        }
      } else {
        // Sign in
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Get user profile with wallet info
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileError) throw profileError;

          // Store wallet info in localStorage
          const wallet = {
            username: profile.email,
            role: profile.role,
            address: profile.wallet_address,
            secret: profile.wallet_secret,
            balance: '0', // Will be updated when dashboard loads
          };
          localStorage.setItem('userWallet', JSON.stringify(wallet));
        }
      }

      // Redirect to appropriate dashboard
      router.push(role === 'donor' ? '/donor' : '/ngo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {isSignUp && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <div className="mt-1 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="donor"
                    checked={role === 'donor'}
                    onChange={(e) => setRole(e.target.value as 'donor')}
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2">Donor</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="ngo"
                    checked={role === 'ngo'}
                    onChange={(e) => setRole(e.target.value as 'ngo')}
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2">NGO</span>
                </label>
              </div>
            </div>

            {role === 'ngo' && (
              <>
                <div>
                  <label htmlFor="ngoName" className="block text-sm font-medium text-gray-700">
                    NGO Name
                  </label>
                  <input
                    type="text"
                    id="ngoName"
                    value={ngoName}
                    onChange={(e) => setNgoName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="ngoDescription" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="ngoDescription"
                    value={ngoDescription}
                    onChange={(e) => setNgoDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="ngoCategory" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="ngoCategory"
                    value={ngoCategory}
                    onChange={(e) => setNgoCategory(e.target.value as any)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="education">Education</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="environment">Environment</option>
                    <option value="humanitarian">Humanitarian</option>
                  </select>
                </div>
              </>
            )}
          </>
        )}

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </form>
    </div>
  );
} 