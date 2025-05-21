import React, { useState } from 'react';
import { Package, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import WasteTypeIcon from '../../components/common/WasteTypeIcon';
import { WasteType } from '../../types';

interface ReceivedItem {
  id: string;
  type: WasteType;
  description: string;
  arrivedAt: Date;
  status: 'pending' | 'processed' | 'rejected';
  collectorName: string;
}

const mockItems: ReceivedItem[] = [
  {
    id: '1',
    type: 'furniture',
    description: 'Vintage wooden table',
    arrivedAt: new Date(),
    status: 'pending',
    collectorName: 'Lucas Bernard'
  },
  {
    id: '2',
    type: 'electronics',
    description: 'Working LCD TV',
    arrivedAt: new Date(Date.now() - 3600000),
    status: 'processed',
    collectorName: 'Julie Moreau'
  }
];

const DepositDashboard: React.FC = () => {
  const [items] = useState<ReceivedItem[]>(mockItems);

  const stats = {
    todayItems: 12,
    pendingItems: 3,
    totalValue: 450
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-emerald-50">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm text-emerald-600 font-medium">Today's Items</p>
              <p className="text-2xl font-bold text-emerald-700">{stats.todayItems}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-amber-50">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm text-amber-600 font-medium">Pending Items</p>
              <p className="text-2xl font-bold text-amber-700">{stats.pendingItems}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-teal-50">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-teal-600" />
            <div className="ml-4">
              <p className="text-sm text-teal-600 font-medium">Total Value</p>
              <p className="text-2xl font-bold text-teal-700">€{stats.totalValue}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Items */}
      <Card title="Recent Items" className="mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arrived
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <WasteTypeIcon type={item.type} withLabel />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.collectorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.arrivedAt.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : item.status === 'processed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="success">
                          Accept
                        </Button>
                        <Button size="sm" variant="danger">
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alerts */}
      <Card>
        <div className="flex items-center text-amber-600">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <h3 className="font-medium">Important Notices</h3>
        </div>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p>• Storage area B is reaching capacity (85%)</p>
          <p>• 3 items awaiting quality inspection</p>
        </div>
      </Card>
    </div>
  );
};

export default DepositDashboard;