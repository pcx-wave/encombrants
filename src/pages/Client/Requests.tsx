import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package, Clock, Euro } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import WasteTypeIcon from '../../components/common/WasteTypeIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useRequest } from '../../contexts/RequestContext';
import { PickupRequest } from '../../types';

const ClientRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const { getRequestsByClientId } = useRequest();
  const [requests, setRequests] = useState<PickupRequest[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/requests');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const userRequests = currentUser?.id ? requests.filter(request => request.clientId === currentUser.id) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        <Link to="/client/new-request">
          <Button>New Request</Button>
        </Link>
      </div>

      <div className="space-y-6">
        {userRequests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              {/* Request Details */}
              <div className="flex-grow space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-emerald-100 rounded-lg p-3">
                      <Package className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.description || `${request.volume}m³ of waste`}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {request.wasteType.map(type => (
                        <WasteTypeIcon key={type} type={type} withLabel />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {request.location.address}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                  {request.weight && (
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      {request.weight}kg
                    </div>
                  )}
                </div>

                {/* Proposals */}
                {request.proposals.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Proposals ({request.proposals.length})
                    </h4>
                    <div className="space-y-2">
                      {request.proposals.slice(0, 2).map((proposalId) => (
                        <div key={proposalId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Euro className="w-5 h-5 text-emerald-600" />
                            <span className="font-medium">€75</span>
                            <span className="text-sm text-gray-500">by John Doe</span>
                          </div>
                          <Button size="sm" variant="outline">View Details</Button>
                        </div>
                      ))}
                      {request.proposals.length > 2 && (
                        <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                          View all proposals
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status and Actions */}
              <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                
                <div className="flex flex-col space-y-2">
                  <Button variant="primary" size="sm">
                    View Details
                  </Button>
                  {request.status === 'pending' && (
                    <Button variant="outline" size="sm">
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientRequests;
