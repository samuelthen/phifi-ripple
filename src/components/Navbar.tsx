'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const userWallet = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userWallet') || 'null') : null;

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (!userWallet) {
      e.preventDefault();
      router.push('/');
    } else {
      router.push('/donor');
    }
  };

  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/PHIFI.png"
                alt="PHIFI"
                width={100}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>
          <div className="hidden sm:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="border-transparent text-gray-500 hover:border-indigo-500 hover:text-indigo-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/ngos"
                className="border-transparent text-gray-500 hover:border-indigo-500 hover:text-indigo-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Browse Our NGOs
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/donor"
                onClick={handleDashboardClick}
                className="border-transparent text-gray-500 hover:border-indigo-500 hover:text-indigo-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {userWallet && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4 bg-black px-4 py-2 rounded-lg">
                  <Image
                    src="/xrpl-logo.svg"
                    alt="XRPL"
                    width={80}
                    height={24}
                    className="h-6 w-auto"
                  />
                  <div className="text-sm text-white">
                    {formatWalletAddress(userWallet.address)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 