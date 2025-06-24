import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, Clock, Euro, ArrowLeft, CreditCard, User, Star } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import WasteTypeIcon from '../../components/common/WasteTypeIcon';
import Map from '../../components/Map';
import { PickupRequest, Proposal } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ProposalWithCollector extends Proposal {
  collector: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    vehicle_type: string;
    rating: number;
    completed_jobs: number;
  };
}

const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [proposals, setProposals] = useState<ProposalWithCollector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const token = (await import('../../utils/supabaseClient')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);
        const authToken = await token;
        
        if (!authToken) {
          throw new Error('No authentication token');
        }

        const [requestResponse, proposalsResponse] = await Promise.all([
          fetch(`/api/requests/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          }),
          fetch(`/api/proposals/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          })
        ]);

        if (!requestResponse.ok || !proposalsResponse.ok) {
          throw new Error('Failed to fetch request details');
        }

        const requestData = await requestResponse.json();
        const proposalsData = await proposalsResponse.json();

        // Transform request data
        const transformedRequest: PickupRequest = {
          id: requestData.id,
          clientId: requestData.client_id,
          status: requestData.status,
          wasteType: requestData.waste_types,
          volume: requestData.volume,
          weight: requestData.weight,
          photos: requestData.photos || [],
          location: {
            address: requestData.location_address,
            lat: requestData.location_lat,
            lng: requestData.location_lng
          },
          availabilityWindows: (requestData.availability_windows || []).map((window: any) => ({
            start: new Date(window.start_time),
            end: new Date(window.end_time)
          })),
          description: requestData.description,
          createdAt: new Date(requestData.created_at),
          proposals: []
        };

        // Transform proposals data
        const transformedProposals: ProposalWithCollector[] = proposalsData.map((proposal: any) => ({
          id: proposal.id,
          requestId: proposal.request_id,
          collectorId: proposal.collector_id,
          price: proposal.price,
          scheduledTime: {
            start: new Date(proposal.scheduled_start),
            end: new Date(proposal.scheduled_end)
          },
          status: proposal.status,
          createdAt: new Date(proposal.created_at),
          collector: proposal.collector
        }));

        setRequest(transformedRequest);
        setProposals(transformedProposals);
      } catch (error) {
        setError('Failed to load request details');
        console.error('Error fetching request details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const handlePayment = async (proposalId: string) => {
    try {
      setActionLoading(`payment-${proposalId}`);
      
      const token = (await import('../../utils/supabaseClient')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);
      const authToken = await token;
      
      if (!authToken) {
        throw new Error('No authentication token');
      }

      // Create payment intent
      const paymentResponse = await fetch(`/api/proposals/${proposalId}/payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const paymentIntent = await paymentResponse.json();
      
      // For demo purposes, simulate successful payment
      // In production, you would integrate with Stripe Elements here
      const confirmResponse = await fetch(`/api/proposals/${proposalId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntent.id
        })
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error || 'Failed to confirm payment');
      }

      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error instanceof Error ? error.message : 'Failed to process payment');
    } finally {
      setActionLoading(null);
      setShowPayment(null);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      setActionLoading(`reject-${proposalId}`);
      
      const token = (await import('../../utils/supabaseClient')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);
      const authToken = await token;
      
      if (!authToken) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/proposals/${proposalId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject proposal');
      }

      // Update local state
      setProposals(prev => 
        prev.map(p => 
          p.id === proposalId 
            ? { ...p, status: 'rejected' as const }
            : p
        )
      );
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      setError(error instanceof Error ? error.message : 'Failed to reject proposal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelRequest = async () => {
    if (!request) return;
    
    try {
      setActionLoading('cancel-request');
      
      const token = (await import('../../utils/supabaseClient')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);
      const authToken = await token;
      
      if (!authToken) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/requests/${request.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel request');
      }

      // Update local state
      setRequest(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (error) {
      console.error('Error cancelling request:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel request');
    } finally {
      setActionLoading(null);
    }
  };

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
                  : request.status === 'scheduled'
                  ? 'bg-purple-100 text-purple-800'
                  : request.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : request.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
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

                    {/* Collector Info */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-emerald-100 rounded-full p-2">
                          <User className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-gray-900">{proposal.collector.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="capitalize">{proposal.collector.vehicle_type}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              <span>{proposal.collector.rating}</span>
                            </div>
                            <span>•</span>
                            <span>{proposal.collector.completed_jobs} jobs</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(proposal.scheduledTime.start).toLocaleString()}
                      </p>
                    </div>

                    {proposal.status === 'pending' && request.status === 'pending' && (
                      <div className="space-y-2">
                        {showPayment === proposal.id ? (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Confirm Payment</h4>
                            <p className="text-sm text-blue-700 mb-3">
                              You're about to pay €{proposal.price} to {proposal.collector.name}
                            </p>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="primary"
                                leftIcon={<CreditCard className="w-4 h-4" />}
                                onClick={() => handlePayment(proposal.id)}
                                isLoading={actionLoading === `payment-${proposal.id}`}
                                disabled={!!actionLoading}
                              >
                                Pay Now
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowPayment(null)}
                                disabled={!!actionLoading}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="success"
                              fullWidth
                              leftIcon={<CreditCard className="w-4 h-4" />}
                              onClick={() => setShowPayment(proposal.id)}
                              disabled={!!actionLoading}
                            >
                              Accept & Pay
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              fullWidth
                              onClick={() => handleRejectProposal(proposal.id)}
                              isLoading={actionLoading === `reject-${proposal.id}`}
                              disabled={!!actionLoading}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {request.status === 'pending' && (
            <Button
              variant="danger"
              fullWidth
              onClick={handleCancelRequest}
              isLoading={actionLoading === 'cancel-request'}
              disabled={!!actionLoading}
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