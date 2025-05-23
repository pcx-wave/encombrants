```tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, Clock, Euro, ArrowLeft } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import WasteTypeIcon from '../../components/common/WasteTypeIcon';
import Map from '../../components/Map';
import { PickupRequest, Proposal } from '../../types';

const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const [requestResponse, proposalsResponse] = await Promise.all([
          fetch(`/api/requests/${id}`),
          fetch(`/api/proposals/${id}`)
        ]);

        if (!requestResponse.ok || !proposalsResponse.ok) {
          throw new Error('Failed to fetch request details');
        }

        const requestData = await requestResponse.json();
        const proposalsData = await proposalsResponse.json();

        setRequest(requestData);
        setProposals(proposalsData);
      } catch (error) {
        setError('Failed to load request details');
        console.error('Error fetching request details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error || 'Request not found'}</p>
            <Button onClick={() => navigate('/client/requests')} variant="outline">
              Back to Requests
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/client/requests')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Requests
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Request Overview */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {request.description || `${request.volume}m³ of waste`}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  {request.wasteType.map(type => (
                    <WasteTypeIcon key={type} type={type} size={24} withLabel />
                  ))}
                </div>
              </div>
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
            </div>
          </Card>

          {/* Location Map */}
          <Card title="Pickup Location">
            <Map
              requests={[request]}
              center={[request.location.lat, request.location.lng]}
              zoom={15}
              height="300px"
            />
            <div className="mt-4 flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              {request.location.address}
            </div>
          </Card>

          {/* Details */}
          <Card title="Request Details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Volume</p>
                  <p className="text-lg font-medium">{request.volume} m³</p>
                </div>
                {request.weight && (
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="text-lg font-medium">{request.weight} kg</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Availability Windows</p>
                <div className="space-y-2">
                  {request.availabilityWindows.map((window, index) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-700 bg-gray-50 p-2 rounded"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {new Date(window.start).toLocaleString()} - {new Date(window.end).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {request.photos && request.photos.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Photos</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {request.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Waste item ${index + 1}`}
                        className="rounded-lg object-cover aspect-square"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Proposals Sidebar */}
        <div className="space-y-6">
          <Card title={`Proposals (${proposals.length})`}>
            {proposals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No proposals yet
              </p>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-lg">€{proposal.price}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        proposal.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : proposal.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(proposal.scheduledTime.start).toLocaleString()}
                      </p>
                    </div>

                    {proposal.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="success"
                          fullWidth
                          onClick={() => {/* TODO: Accept proposal */}}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          fullWidth
                          onClick={() => {/* TODO: Reject proposal */}}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {request.status === 'pending' && (
            <Button
              variant="outline"
              fullWidth
              onClick={() => {/* TODO: Cancel request */}}
            >
              Cancel Request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
```