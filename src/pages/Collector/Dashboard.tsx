import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, TrendingUp, Route as RouteIcon } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import WasteTypeIcon from '../../components/common/WasteTypeIcon';
import { PickupRequest } from '../../types';
import Map from '../../components/Map';

const CollectorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [compatibleRequests, setCompatibleRequests] = useState<PickupRequest[]>([]);
  const [selectedMarkerRequest, setSelectedMarkerRequest] = useState<string | null>(null);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/requests');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const filteredRequests = data.filter((request: PickupRequest) => request.status === 'pending');
        setCompatibleRequests(filteredRequests);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        setError('Failed to fetch available requests');
      }
    };

    fetchRequests();
  }, []);

  const handleRequestSelection = (requestId: string) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleMarkerClick = (request: PickupRequest) => {
    setSelectedMarkerRequest(request.id);
    const element = document.getElementById(`request-${request.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-emerald-50');
      setTimeout(() => element.classList.remove('bg-emerald-50'), 2000);
    }
  };

  const handleGenerateRoute = async () => {
    if (selectedRequests.length === 0) return;

    setIsGeneratingRoute(true);
    setError(null);

    try {
      const response = await fetch('/api/compute_route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestIds: selectedRequests,
          startTime: new Date().toISOString() // For demo purposes, using current time
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate route');
      }

      const routeData = await response.json();
      navigate('/collector/routes', { state: { route: routeData } });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate route');
    } finally {
      setIsGeneratingRoute(false);
    }
  };

  const stats = {
    availableRequests: compatibleRequests.length,
    completedToday: 5,
    totalEarnings: 350
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-emerald-50">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm text-emerald-600 font-medium">Available Requests</p>
              <p className="text-2xl font-bold text-emerald-700">{stats.availableRequests}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50">
          <div className="flex items-center">
            <RouteIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-blue-600 font-medium">Completed Today</p>
              <p className="text-2xl font-bold text-blue-700">{stats.completedToday}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-teal-50">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-teal-600" />
            <div className="ml-4">
              <p className="text-sm text-teal-600 font-medium">Today's Earnings</p>
              <p className="text-2xl font-bold text-teal-700">€{stats.totalEarnings}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Available Requests */}
      <Card
        title="Available Requests"
        subtitle="Select multiple requests to generate an optimized route"
        className="mb-8"
      >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <Map 
          requests={compatibleRequests} 
          height="500px"
          onMarkerClick={handleMarkerClick}
        />

        <div className="space-y-4 mt-6">
          {compatibleRequests.map((request) => (
            <div
              id={`request-${request.id}`}
              key={request.id}
              className={`p-4 rounded-lg border transition-colors ${
                selectedRequests.includes(request.id)
                  ? 'border-emerald-500 bg-emerald-50'
                  : selectedMarkerRequest === request.id
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={selectedRequests.includes(request.id)}
                  onChange={() => handleRequestSelection(request.id)}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <div className="ml-4 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-2">
                        {request.wasteType.map(type => (
                          <WasteTypeIcon key={type} type={type} size={24} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {request.volume}m³
                        {request.weight && ` / ${request.weight}kg`}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">
                      €{request.proposals[0]?.price || '---'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{request.description}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {request.location.address}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            onClick={handleGenerateRoute}
            disabled={selectedRequests.length === 0 || isGeneratingRoute}
            isLoading={isGeneratingRoute}
            fullWidth
            size="lg"
          >
            Generate Optimized Route ({selectedRequests.length} stops)
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CollectorDashboard;