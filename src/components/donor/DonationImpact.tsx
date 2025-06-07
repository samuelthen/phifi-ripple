'use client';

import type { DonationImpact } from '@/data/mockData';

interface DonationImpactProps {
  impacts: DonationImpact[];
}

export default function DonationImpact({ impacts }: DonationImpactProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      education: 'bg-blue-100 text-blue-800',
      healthcare: 'bg-green-100 text-green-800',
      environment: 'bg-emerald-100 text-emerald-800',
      humanitarian: 'bg-purple-100 text-purple-800',
      food: 'bg-orange-100 text-orange-800',
      wages: 'bg-yellow-100 text-yellow-800',
      transport: 'bg-indigo-100 text-indigo-800',
      supplies: 'bg-pink-100 text-pink-800',
      operations: 'bg-gray-100 text-gray-800',
      emergency: 'bg-red-100 text-red-800',
      community: 'bg-teal-100 text-teal-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Donation Impact</h2>
      <div className="space-y-4">
        {impacts.map((impact) => (
          <div key={impact.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{impact.ngoName}</h3>
                <p className="text-sm text-gray-600">{formatDate(impact.timestamp)}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(impact.category)}`}>
                {impact.category}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium">{impact.amount} XRP</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recipient</p>
                <p className="font-medium">{impact.recipient}</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">Transaction</p>
              <p className="font-mono text-xs break-all">{impact.txHash}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 