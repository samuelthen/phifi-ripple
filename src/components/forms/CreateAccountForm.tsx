'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTestnetWallet, UserWallet } from '@/lib/xrpl/wallet';

export default function CreateAccountForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'donor' | 'ngo'>('donor');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const wallet = await createTestnetWallet(username, role);
      
      // Store wallet info in localStorage
      localStorage.setItem('userWallet', JSON.stringify(wallet));
      
      // Redirect to appropriate dashboard
      router.push(role === 'donor' ? '/donor' : '/ngo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

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

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
} 