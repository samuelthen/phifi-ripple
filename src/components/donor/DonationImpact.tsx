'use client';

import { useMemo } from 'react';
import { DonutChart } from '@tremor/react';

interface ImpactMetric {
  category: string;
  amount: string;
  percentage: number;
  description: string;
}

interface DonationImpactProps {
  impacts: {
    id: string;
    donationId: string;
    ngoId: string;
    ngoName: string;
    amount: string;
    category: string;
    recipient: string;
    timestamp: number;
    txHash: string;
    impactMetrics?: ImpactMetric[];
  }[];
}

export default function DonationImpact({ impacts }: DonationImpactProps) {
  const impactData = useMemo(() => {
    // Calculate total impact by category
    const categoryTotals = impacts.reduce((acc, impact) => {
      const amount = parseFloat(impact.amount);
      acc[impact.category] = (acc[impact.category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to chart data format
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));
  }, [impacts]);

  const totalImpact = useMemo(() => {
    return impacts.reduce((sum, impact) => sum + parseFloat(impact.amount), 0);
  }, [impacts]);

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Impact Distribution</h3>
          <DonutChart
            data={impactData}
            category="value"
            index="name"
            valueFormatter={(value: number) => `${value.toFixed(2)} XRP`}
            colors={['blue', 'green', 'emerald', 'purple', 'orange', 'yellow', 'indigo', 'pink', 'gray', 'red', 'teal']}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Impact Summary</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Impact</p>
              <p className="text-2xl font-bold">{totalImpact.toFixed(2)} XRP</p>
            </div>

            <div className="space-y-2">
              {impactData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.name)}`}>
                    {item.name}
                  </span>
                  <span className="font-medium">{item.value.toFixed(2)} XRP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Recent Impact Activities</h3>
        <div className="space-y-4">
          {impacts.map((impact) => (
            <div key={impact.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{impact.ngoName}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(impact.timestamp).toLocaleDateString()}
                  </p>
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
              {impact.impactMetrics && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Impact Details</p>
                  <div className="mt-1 space-y-1">
                    {impact.impactMetrics.map((metric, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{metric.category}:</span>{' '}
                        {metric.description} ({metric.percentage}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 