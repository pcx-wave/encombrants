import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PickupRequest, Proposal, WasteType } from '../types';
import mockData from '../data/mockData';

interface RequestContextType {
  requests: PickupRequest[];
  getRequestById: (id: string) => PickupRequest | undefined;
  getRequestsByClientId: (clientId: string) => PickupRequest[];
  getCompatibleRequestsByCollectorId: (collectorId: string) => PickupRequest[];
  createRequest: (request: Omit<PickupRequest, 'id' | 'createdAt' | 'proposals'>) => Promise<PickupRequest>;
  updateRequest: (id: string, updates: Partial<PickupRequest>) => Promise<PickupRequest>;
  deleteRequest: (id: string) => Promise<void>;
  createProposal: (proposal: Omit<Proposal, 'id' | 'createdAt'>) => Promise<Proposal>;
  acceptProposal: (proposalId: string) => Promise<void>;
  rejectProposal: (proposalId: string) => Promise<void>;
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
  const [requests, setRequests] = useState<PickupRequest[]>(mockData.requests);
  const [proposals, setProposals] = useState<Proposal[]>(mockData.proposals);

  const getRequestById = (id: string) => {
    return requests.find(request => request.id === id);
  };

  const getRequestsByClientId = (clientId: string) => {
    return requests.filter(request => request.clientId === clientId);
  };

  const getCompatibleRequestsByCollectorId = (collectorId: string) => {
    const collector = mockData.collectors.find(c => c.id === collectorId);
    if (!collector) return [];

    return requests.filter(request => {
      // Only show pending requests
      if (request.status !== 'pending') return false;

      // Check if collector supports all waste types in the request
      const supportsAllWasteTypes = request.wasteType.every(type =>
        collector.supportedWasteTypes.includes(type as WasteType)
      );

      // Check if collector's vehicle has enough capacity
      const hasEnoughCapacity =
        request.volume <= collector.vehicle.capacity.volume &&
        (!request.weight || request.weight <= collector.vehicle.capacity.weight);

      return supportsAllWasteTypes && hasEnoughCapacity;
    });
  };

  const createRequest = async (requestData: Omit<PickupRequest, 'id' | 'createdAt' | 'proposals'>) => {
    return new Promise<PickupRequest>((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const newRequest: PickupRequest = {
          id: `request-${Date.now()}`,
          createdAt: new Date(),
          proposals: [],
          ...requestData
        };

        setRequests(prev => [...prev, newRequest]);
        resolve(newRequest);
      }, 500);
    });
  };

  const updateRequest = async (id: string, updates: Partial<PickupRequest>) => {
    return new Promise<PickupRequest>((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        const index = requests.findIndex(r => r.id === id);
        if (index === -1) {
          reject(new Error('Request not found'));
          return;
        }

        const updatedRequest = { ...requests[index], ...updates };
        const newRequests = [...requests];
        newRequests[index] = updatedRequest;

        setRequests(newRequests);
        resolve(updatedRequest);
      }, 500);
    });
  };

  const deleteRequest = async (id: string) => {
    return new Promise<void>((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        const index = requests.findIndex(r => r.id === id);
        if (index === -1) {
          reject(new Error('Request not found'));
          return;
        }

        const newRequests = [...requests];
        newRequests.splice(index, 1);

        setRequests(newRequests);
        resolve();
      }, 500);
    });
  };

  const createProposal = async (proposalData: Omit<Proposal, 'id' | 'createdAt'>) => {
    return new Promise<Proposal>((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const newProposal: Proposal = {
          id: `proposal-${Date.now()}`,
          createdAt: new Date(),
          ...proposalData
        };

        setProposals(prev => [...prev, newProposal]);

        // Update the request with the new proposal
        const requestIndex = requests.findIndex(r => r.id === proposalData.requestId);
        if (requestIndex !== -1) {
          const updatedRequest = { 
            ...requests[requestIndex],
            proposals: [...requests[requestIndex].proposals, newProposal.id]
          };
          
          const newRequests = [...requests];
          newRequests[requestIndex] = updatedRequest;
          setRequests(newRequests);
        }

        resolve(newProposal);
      }, 500);
    });
  };

  const acceptProposal = async (proposalId: string) => {
    return new Promise<void>((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        const proposalIndex = proposals.findIndex(p => p.id === proposalId);
        if (proposalIndex === -1) {
          reject(new Error('Proposal not found'));
          return;
        }

        // Update the proposal status
        const updatedProposal = { ...proposals[proposalIndex], status: 'accepted' as const };
        const newProposals = [...proposals];
        newProposals[proposalIndex] = updatedProposal;

        // Update the request status
        const requestId = updatedProposal.requestId;
        const requestIndex = requests.findIndex(r => r.id === requestId);
        if (requestIndex !== -1) {
          const updatedRequest = { 
            ...requests[requestIndex],
            status: 'matched' as const
          };
          
          const newRequests = [...requests];
          newRequests[requestIndex] = updatedRequest;
          setRequests(newRequests);
        }

        setProposals(newProposals);
        resolve();
      }, 500);
    });
  };

  const rejectProposal = async (proposalId: string) => {
    return new Promise<void>((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        const proposalIndex = proposals.findIndex(p => p.id === proposalId);
        if (proposalIndex === -1) {
          reject(new Error('Proposal not found'));
          return;
        }

        // Update the proposal status
        const updatedProposal = { ...proposals[proposalIndex], status: 'rejected' as const };
        const newProposals = [...proposals];
        newProposals[proposalIndex] = updatedProposal;

        setProposals(newProposals);
        resolve();
      }, 500);
    });
  };

  const value = {
    requests,
    getRequestById,
    getRequestsByClientId,
    getCompatibleRequestsByCollectorId,
    createRequest,
    updateRequest,
    deleteRequest,
    createProposal,
    acceptProposal,
    rejectProposal
  };

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
};