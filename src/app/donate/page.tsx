'use client';

import DonationForm from '@/components/forms/DonationForm';

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Make a Donation</h1>
          <p className="mt-2 text-sm text-gray-500">
            Support verified NGOs and track your impact through NFT receipts
          </p>
        </div>

        <DonationForm />
      </div>
    </main>
  );
} 