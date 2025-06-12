import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PickupRequest, Proposal, WasteType } from '../types';
import { useAuth } from './AuthContext';

interface RequestContextType {
  requests: PickupRequest[];
  isLoading: boolean;
  error: string | null;
  getRequestById: (id: string) => PickupRequest | undefined;
  getRequestsByClientId: (clientId: string) => PickupRequest[];
  getCompatibleRequestsByCollectorId: (collectorId: string) => PickupRequest[];
  createRequest: (request: Omit<PickupRequest, 'id' | 'createdAt' | 'proposals'>) => Promise<PickupRequest>;
  updateRequest: (id: string, updates: Partial<PickupRequest>) => Promise<PickupRequest>;
  deleteRequest: (id: string) => Promise<void>;
  createProposal: (proposal: Omit<Proposal, 'id' | 'createdAt'>) => Promise<Proposal>;
  acceptProposal: (proposalId: string) => Promise<void>;
  rejectProposal: (proposalId: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  refreshRequests: () => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const useRequest = (): RequestContextType => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequest must be used within a RequestProvider');
  }
  return context;
};

interface RequestProviderProps {
  children: ReactNode;
}

export const RequestProvider: React.FC<RequestProviderProps> = ({ children }) => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Transform backend data to frontend format
  const transformRequest = (backendRequest: any): PickupRequest => {
    return {
      id: backendRequest.id,
      clientId: backendRequest.client_id,
      status: backendRequest.status,
      wasteType: backendRequest.waste_types,
      volume: backendRequest.volume,
      weight: backendRequest.weight,
      photos: backendRequest.photos || [],
      location: {
        address: backendRequest.location_address,
        lat: backendRequest.location_lat,
        lng: backendRequest.location_lng
      },
      availabilityWindows: (backendRequest.availability_windows || []).map((window: any) => ({
        start: new Date(window.start_time),
        end: new Date(window.end_time)
      })),
      description: backendRequest.description,
      createdAt: new Date(backendRequest.created_at),
      proposals: [] // Will be populated separately when needed
    };
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/requests');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const transformedRequests = data.map(transformRequest);
      setRequests(transformedRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getRequestById = (id: string) => {
    return requests.find(request => request.id === id);
  };

  const getRequestsByClientId = (clientId: string) => {
    return requests.filter(request => request.clientId === clientId);
  };

  const getCompatibleRequestsByCollectorId = (collectorId: string) => {
    // For now, return all pending requests
    // In a real implementation, you would filter based on collector capabilities
    return requests.filter(request => request.status === 'pending');
  };

  const createRequest = async (requestData: Omit<PickupRequest, 'id' | 'createdAt' | 'proposals'>) => {
    try {
      const payload = {
        clientId: requestData.clientId,
        wasteType: requestData.wasteType,
        volume: requestData.volume,
        weight: requestData.weight,
        photos: requestData.photos,
        location: requestData.location,
        availabilityWindows: requestData.availabilityWindows.map(window => ({
          start: window.start.toISOString(),
          end: window.end.toISOString()
        })),
        description: requestData.description
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create request');
      }

      const result = await response.json();
      const newRequest = transformRequest(result.data);
      
      setRequests(prev => [...prev, newRequest]);
      return newRequest;
    } catch (error) {
      throw error;
    }
  };

  const updateRequest = async (id: string, updates: Partial<PickupRequest>) => {
    // This would be implemented when needed
    throw new Error('Update request not implemented yet');
  };

  const deleteRequest = async (id: string) => {
    // This would be implemented when needed
    throw new Error('Delete request not implemented yet');
  };

  const createProposal = async (proposalData: Omit<Proposal, 'id' | 'createdAt'>) => {
    try {
      const payload = {
        requestId: proposalData.requestId,
        collectorId: proposalData.collectorId,
        price: proposalData.price,
        scheduledStart: proposalData.scheduledTime.start.toISOString(),
        scheduledEnd: proposalData.scheduledTime.end.toISOString()
      };

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create proposal');
      }

      const result = await response.json();
      
      // Transform backend proposal to frontend format
      const newProposal: Proposal = {
        id: result.data.id,
        requestId: result.data.request_id,
        collectorId: result.data.collector_id,
        price: result.data.price,
        scheduledTime: {
          start: new Date(result.data.scheduled_start),
          end: new Date(result.data.scheduled_end)
        },
        status: result.data.status,
        createdAt: new Date(result.data.created_at)
      };

      return newProposal;
    } catch (error) {
      throw error;
    }
  };

  const acceptProposal = async (proposalId: string) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept proposal');
      }

      // Refresh requests to get updated status
      await fetchRequests();
    } catch (error) {
      throw error;
    }
  };

  const rejectProposal = async (proposalId: string) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject proposal');
      }

      // Refresh requests to get updated status
      await fetchRequests();
    } catch (error) {
      throw error;
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel request');
      }

      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status: 'cancelled' as const }
            : request
        )
      );
    } catch (error) {
      throw error;
    }
  };

  const refreshRequests = async () => {
    await fetchRequests();
  };

  const value = {
    requests,
    isLoading,
    error,
    getRequestById,
    getRequestsByClientId,
    getCompatibleRequestsByCollectorId,
    createRequest,
    updateRequest,
    deleteRequest,
    createProposal,
    acceptProposal,
    rejectProposal,
    cancelRequest,
    refreshRequests
  };

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
};