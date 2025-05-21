import React from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, Clock, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useRequest } from '../../contexts/RequestContext';

const ClientDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { getRequestsByClientId } = useRequest();

  const requests = currentUser?.id ? getRequestsByClientId(currentUser.id) : [];
  
  const stats = {
    activeRequests: requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length,
    completedRequests: requests.filter(r => r.status === 'completed').length,
    totalSpent: requests
      .filter(r => r.status === 'completed')
      .reduce((total, request) => {
        const acceptedProposal = request.proposals.find(p => p === 'accepted');
        return total + (acceptedProposal ? 0 : 0); // TODO: Add actual price calculation
      }, 0)
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Quick Actions */}
      <div className="mb-8">
        <Link to="/client/new-request">
          <Button
            size="lg"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            New Pickup Request
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-emerald-50">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm text-emerald-600 font-medium">Active Requests</p>
              <p className="text-2xl font-bold text-emerald-700">{stats.activeRequests}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-blue-600 font-medium">Completed Requests</p>
              <p className="text-2xl font-bold text-blue-700">{stats.completedRequests}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-teal-50">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-teal-600" />
            <div className="ml-4">
              <p className="text-sm text-teal-600 font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-teal-700">€{stats.totalSpent}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card 
        title="Recent Requests" 
        subtitle="View and manage your pickup requests"
        className="mb-8"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proposals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.slice(0, 5).map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.description || `${request.volume}m³ of waste`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.wasteType.join(', ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'matched'
                        ? 'bg-blue-100 text-blue-800'
                        : request.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.proposals.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link to={`/client/requests/${request.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {requests.length > 5 && (
          <div className="mt-4 text-center">
            <Link to="/client/requests">
              <Button variant="outline">View All Requests</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClientDashboard;