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
      education: 'bg-blue-900 text-blue-300',
      healthcare: 'bg-green-900 text-green-300',
      environment: 'bg-emerald-900 text-emerald-300',
      humanitarian: 'bg-purple-900 text-purple-300',
      food: 'bg-orange-900 text-orange-300',
      wages: 'bg-yellow-900 text-yellow-300',
      transport: 'bg-indigo-900 text-indigo-300',
      supplies: 'bg-pink-900 text-pink-300',
      operations: 'bg-gray-700 text-gray-300',
      emergency: 'bg-red-900 text-red-300',
      community: 'bg-teal-900 text-teal-300',
    };
    return colors[category] || 'bg-gray-700 text-gray-300';
  };

  return (
    <div className="space-y-4">
      {impacts.map((impact) => (
        <div key={impact.id} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-white">{impact.ngoName}</h3>
              <p className="text-sm text-gray-400">{formatDate(impact.timestamp)}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(impact.category)}`}>
              {impact.category}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-sm text-gray-400">Amount</p>
              <p className="font-medium text-indigo-400">{impact.amount} XRP</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Purpose</p>
              <p className="font-medium text-gray-300 capitalize">{impact.recipient}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-400">Transaction</p>
            <p className="font-mono text-xs break-all text-gray-300">{impact.txHash}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 