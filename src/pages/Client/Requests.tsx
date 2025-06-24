import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package, Clock, Euro } from 'lucide-react';
import OptimizedCard from '../../components/common/OptimizedCard';
import TouchOptimizedButton from '../../components/common/TouchOptimizedButton';
import WasteTypeIcon from '../../components/common/WasteTypeIcon';
import LazyImage from '../../components/common/LazyImage';
import VirtualizedList from '../../components/common/VirtualizedList';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { PickupRequest } from '../../types';
import { getOptimizedImageUrl, isMobile } from '../../utils/mobileOptimizations';

const ClientRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = (await import('../../utils/supabaseClient')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);
        const authToken = await token;
        
        if (!authToken) {
          throw new Error('No authentication token');
        }

        const response = await fetch('/api/requests', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform backend data to frontend format
        const transformedRequests = data.map((req: any) => ({
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
        setError('Failed to fetch requests');
        console.error('Failed to fetch requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter requests based on search and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = !debouncedSearchTerm || 
      request.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      request.location.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      request.wasteType.some(type => type.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    const isUserRequest = currentUser?.id ? request.clientId === currentUser.id : false;
    
    return matchesSearch && matchesStatus && isUserRequest;
  });

  const renderRequestItem = (request: PickupRequest, index: number) => (
    <OptimizedCard key={request.id} className="mb-4" lazy={index > 5}>
      <div className="flex flex-col space-y-4">
        {/* Request Header */}
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
              {request.description || `${request.volume}m³ of waste`}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {request.wasteType.slice(0, 3).map(type => (
                <WasteTypeIcon key={type} type={type} size={16} />
              ))}
              {request.wasteType.length > 3 && (
                <span className="text-xs text-gray-500">+{request.wasteType.length - 3} more</span>
              )}
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${
            request.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : request.status === 'matched'
              ? 'bg-blue-100 text-blue-800'
              : request.status === 'scheduled'
              ? 'bg-purple-100 text-purple-800'
              : request.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>

        {/* Request Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{request.location.address}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Package className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{request.volume}m³{request.weight && ` • ${request.weight}kg`}</span>
          </div>
          {request.proposals.length > 0 && (
            <div className="flex items-center">
              <Euro className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{request.proposals.length} proposal{request.proposals.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Photos Preview */}
        {request.photos && request.photos.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto">
            {request.photos.slice(0, 3).map((photo, photoIndex) => (
              <LazyImage
                key={photoIndex}
                src={getOptimizedImageUrl(photo, 100, 80)}
                alt={`Waste item ${photoIndex + 1}`}
                className="w-16 h-16 rounded-lg flex-shrink-0"
              />
            ))}
            {request.photos.length > 3 && (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                +{request.photos.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to={`/client/requests/${request.id}`} className="flex-1">
            <TouchOptimizedButton variant="primary" size="sm" fullWidth>
              View Details
            </TouchOptimizedButton>
          </Link>
          {request.status === 'pending' && (
            <TouchOptimizedButton variant="outline" size="sm" fullWidth>
              Cancel Request
            </TouchOptimizedButton>
          )}
        </div>
      </div>
    </OptimizedCard>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <OptimizedCard key={i} isLoading />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OptimizedCard error={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        <Link to="/client/new-request">
          <TouchOptimizedButton>New Request</TouchOptimizedButton>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="matched">Matched</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <OptimizedCard>
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {requests.length === 0 ? 'No requests yet' : 'No matching requests'}
            </h3>
            <p className="text-gray-500 mb-4">
              {requests.length === 0 
                ? 'Create your first pickup request to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {requests.length === 0 && (
              <Link to="/client/new-request">
                <TouchOptimizedButton>Create Request</TouchOptimizedButton>
              </Link>
            )}
          </div>
        </OptimizedCard>
      ) : isMobile() && filteredRequests.length > 10 ? (
        // Use virtualized list for mobile with many items
        <VirtualizedList
          items={filteredRequests}
          itemHeight={200}
          containerHeight={600}
          renderItem={renderRequestItem}
          className="space-y-4"
        />
      ) : (
        // Regular list for desktop or smaller lists
        <div className="space-y-4">
          {filteredRequests.map((request, index) => renderRequestItem(request, index))}
        </div>
      )}
    </div>
  );
};

export default ClientRequests;