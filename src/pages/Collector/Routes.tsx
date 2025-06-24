import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Package, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import WasteTypeIcon from '../../components/common/WasteTypeIcon';
import Map from '../../components/Map';
import { Route, RouteStop, PickupRequest } from '../../types';

const CollectorRoutes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentRoute, setCurrentRoute] = useState<Route | null>(location.state?.route || null);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingStops, setCompletingStops] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentRoute) return;

      try {
        const token = (await import('../../utils/supabaseClient')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);
        const authToken = await token;
        
        if (!authToken) {
          throw new Error('No authentication token');
        }

        const requestIds = currentRoute.stops.map(stop => stop.requestId);
        const promises = requestIds.map(id =>
          fetch(`/api/requests/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          }).then(res => res.json())
        );
        const requestsData = await Promise.all(promises);
        
        // Transform the data to match our PickupRequest interface
        const transformedRequests: PickupRequest[] = requestsData.map((req: any) => ({
          id: req.id,
          clientId: req.client_id,
          status: req.status,
          wasteType: req.waste_types,
          volume: req.volume,
          weight: req.weight,
          photos: req.photos || [],
          location: {
            address: req.location_address,
            lat: req.location_lat,
            lng: req.location_lng
          },
          availabilityWindows: (req.availability_windows || []).map((window: any) => ({
            start: new Date(window.start_time),
            end: new Date(window.end_time)
          })),
          description: req.description,
          createdAt: new Date(req.created_at),
          proposals: []
        }));
        
        setRequests(transformedRequests);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        setError('Failed to load route details');
      }
    };

    fetchRequests();
  }, [currentRoute]);

  const handleConfirmRoute = async () => {
    if (!currentRoute) return;

    setIsConfirming(true);
    setError(null);

    try {
      const token = (await import('../../utils/supabaseClient')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);
      const authToken = await token;
      
      if (!authToken) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/route/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ route_id: currentRoute.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm route');
      }

      setCurrentRoute(prev => prev ? { ...prev, status: 'in_progress' } : null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to confirm route');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCompleteStop = async (stop: RouteStop) => {
    if (!currentRoute) return;

    setCompletingStops(prev => new Set(prev).add(stop.requestId));
    setError(null);

    try {
      const token = (await import('../../utils/supabaseClient')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);
      const authToken = await token;
      
      if (!authToken) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/route/stops/${stop.requestId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete stop');
      }

      // Update local state
      const updatedStops = currentRoute.stops.map(s => 
        s.requestId === stop.requestId ? { ...s, status: 'completed' as const } : s
      );
      
      // Check if all stops are completed
      const allCompleted = updatedStops.every(s => s.status === 'completed' || s.status === 'skipped');
      const newStatus = allCompleted ? 'completed' : currentRoute.status;
      
      setCurrentRoute({ 
        ...currentRoute, 
        stops: updatedStops,
        status: newStatus
      });
    } catch (error) {
      console.error('Failed to complete stop:', error);
      setError('Failed to mark stop as completed');
    } finally {
      setCompletingStops(prev => {
        const newSet = new Set(prev);
        newSet.delete(stop.requestId);
        return newSet;
      });
    }
  };

  if (!currentRoute || requests.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Active Route</h2>
            <p className="text-gray-600 mb-4">
              You don't have any active routes. Generate a new route from the dashboard.
            </p>
            <Button onClick={() => navigate('/collector/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const allStopsCompleted = currentRoute.stops.every(stop => stop.status === 'completed');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Active Route */}
        <div className="md:col-span-2">
          <Card 
            title="Current Route" 
            subtitle={`${currentRoute.stops.length} stops • ${currentRoute.distance} km • Est. ${currentRoute.duration} min`}
            className="mb-8"
          >
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {currentRoute.stops.map((stop, index) => {
                const request = requests.find(r => r.id === stop.requestId);
                if (!request) return null;

                const isCompleting = completingStops.has(stop.requestId);
                const canComplete = index === 0 || currentRoute.stops[index - 1].status === 'completed';

                return (
                  <div key={stop.requestId} className="relative">
                    {index !== currentRoute.stops.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 rounded-full p-2 ${
                        stop.status === 'completed' 
                          ? 'bg-green-100' 
                          : 'bg-emerald-100'
                      }`}>
                        <MapPin className={`w-6 h-6 ${
                          stop.status === 'completed' 
                            ? 'text-green-600' 
                            : 'text-emerald-600'
                        }`} />
                      </div>
                      <div className="ml-4 flex-grow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Stop {index + 1}</p>
                            <p className="text-sm text-gray-600">{request.location.address}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={stop.status === 'completed' ? 'success' : 'primary'}
                            leftIcon={stop.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : undefined}
                            onClick={() => handleCompleteStop(stop)}
                            disabled={stop.status === 'completed' || !canComplete || isCompleting}
                            isLoading={isCompleting}
                          >
                            {stop.status === 'completed' ? 'Completed' : 'Mark Complete'}
                          </Button>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(stop.estimatedArrival).toLocaleTimeString()}
                          </span>
                          <span className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {request.volume}m³
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {request.wasteType.map(type => (
                            <WasteTypeIcon key={type} type={type} size={20} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Final Destination (Disposal Site) */}
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium">Disposal Site</p>
                  <p className="text-sm text-gray-600">Paris North Recycling Center</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Closes at 17:00
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Route Map */}
          <Card>
            <Map
              requests={requests}
              height="400px"
              center={[requests[0].location.lat, requests[0].location.lng]}
              zoom={12}
            />
          </Card>
        </div>

        {/* Route Details */}
        <div>
          <Card title="Route Details" className="mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold">{currentRoute.distance} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Duration</p>
                <p className="text-2xl font-bold">{currentRoute.duration} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold">
                  {requests.reduce((sum, req) => sum + req.volume, 0)} m³
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Waste Types</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.from(new Set(requests.flatMap(req => req.wasteType))).map(type => (
                    <WasteTypeIcon key={type} type={type} size={24} />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Actions" className="space-y-4">
            {currentRoute.status === 'scheduled' ? (
              <Button
                variant="primary"
                fullWidth
                onClick={handleConfirmRoute}
                isLoading={isConfirming}
              >
                Start Route
              </Button>
            ) : allStopsCompleted ? (
              <Button variant="success" fullWidth>
                Route Completed
              </Button>
            ) : (
              <Button variant="primary" fullWidth disabled>
                Route in Progress
              </Button>
            )}
            
            <Button variant="outline" fullWidth>
              Modify Route
            </Button>
            
            {currentRoute.status === 'scheduled' && (
              <Button variant="danger" fullWidth>
                Cancel Route
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CollectorRoutes;