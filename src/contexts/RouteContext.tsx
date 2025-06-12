import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Route, RouteStop, DisposalSite, WasteType } from '../types';
import { useAuth } from './AuthContext';

interface RouteContextType {
  routes: Route[];
  disposalSites: DisposalSite[];
  isLoading: boolean;
  error: string | null;
  getRouteById: (id: string) => Route | undefined;
  getRoutesByCollectorId: (collectorId: string) => Route[];
  createRoute: (
    collectorId: string,
    requestIds: string[],
    startTime: Date
  ) => Promise<Route>;
  updateRouteStatus: (routeId: string, status: Route['status']) => Promise<Route>;
  updateStopStatus: (routeId: string, requestId: string, status: RouteStop['status']) => Promise<Route>;
  getDisposalSites: () => DisposalSite[];
  refreshRoutes: () => Promise<void>;
  refreshDisposalSites: () => Promise<void>;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const useRoute = (): RouteContextType => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
};

interface RouteProviderProps {
  children: ReactNode;
}

export const RouteProvider: React.FC<RouteProviderProps> = ({ children }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [disposalSites, setDisposalSites] = useState<DisposalSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Transform backend route data to frontend format
  const transformRoute = (backendRoute: any): Route => {
    return {
      id: backendRoute.id,
      collectorId: backendRoute.collector_id,
      stops: [], // Will be populated separately
      disposalSiteId: backendRoute.disposal_site_id,
      distance: backendRoute.distance,
      duration: backendRoute.duration,
      startTime: new Date(backendRoute.start_time),
      endTime: new Date(backendRoute.end_time),
      status: backendRoute.status
    };
  };

  // Transform backend disposal site data to frontend format
  const transformDisposalSite = (backendSite: any): DisposalSite => {
    return {
      id: backendSite.id,
      name: backendSite.name,
      location: {
        address: backendSite.address,
        lat: backendSite.lat,
        lng: backendSite.lng
      },
      openingHours: [], // Not implemented in current schema
      acceptedWasteTypes: backendSite.accepted_waste_types as WasteType[]
    };
  };

  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For now, we'll use a simple approach since we don't have a routes endpoint yet
      // In a real implementation, you would fetch routes from the backend
      setRoutes([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
      console.error('Error fetching routes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDisposalSites = async () => {
    try {
      const response = await fetch('/api/deposits');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const transformedSites = data.map(transformDisposalSite);
      setDisposalSites(transformedSites);
    } catch (err) {
      console.error('Error fetching disposal sites:', err);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchDisposalSites();
  }, []);

  const getRouteById = (id: string) => {
    return routes.find(route => route.id === id);
  };

  const getRoutesByCollectorId = (collectorId: string) => {
    return routes.filter(route => route.collectorId === collectorId);
  };

  const createRoute = async (
    collectorId: string,
    requestIds: string[],
    startTime: Date
  ): Promise<Route> => {
    try {
      const payload = {
        requestIds,
        collectorId,
        startTime: startTime.toISOString()
      };

      const response = await fetch('/api/compute_route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create route');
      }

      const result = await response.json();
      
      // Transform the response to match our Route interface
      const newRoute: Route = {
        id: result.route.id,
        collectorId: result.route.collector_id,
        stops: result.stops.map((stop: any) => ({
          requestId: stop.request_id,
          order: stop.stop_order,
          estimatedArrival: new Date(stop.estimated_arrival),
          status: stop.status
        })),
        disposalSiteId: result.route.disposal_site_id,
        distance: result.route.distance,
        duration: result.route.duration,
        startTime: new Date(result.route.start_time),
        endTime: new Date(result.route.end_time),
        status: result.route.status
      };

      setRoutes(prev => [...prev, newRoute]);
      return newRoute;
    } catch (error) {
      throw error;
    }
  };

  const updateRouteStatus = async (
    routeId: string, 
    status: Route['status']
  ): Promise<Route> => {
    try {
      const response = await fetch('/api/route/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ route_id: routeId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update route status');
      }

      // Update local state
      const updatedRoute = routes.find(r => r.id === routeId);
      if (updatedRoute) {
        const newRoute = { ...updatedRoute, status };
        setRoutes(prev => prev.map(r => r.id === routeId ? newRoute : r));
        return newRoute;
      }
      
      throw new Error('Route not found');
    } catch (error) {
      throw error;
    }
  };

  const updateStopStatus = async (
    routeId: string,
    requestId: string,
    status: RouteStop['status']
  ): Promise<Route> => {
    try {
      // Find the stop ID (in a real implementation, you'd have this)
      const route = routes.find(r => r.id === routeId);
      const stop = route?.stops.find(s => s.requestId === requestId);
      
      if (!stop) {
        throw new Error('Stop not found');
      }

      // For now, we'll use the requestId as stopId since we don't have the actual stop ID
      const response = await fetch(`/api/route/stops/${requestId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update stop status');
      }

      // Update local state
      if (route) {
        const updatedStops = route.stops.map(s => 
          s.requestId === requestId ? { ...s, status } : s
        );
        
        // Check if all stops are completed
        const allCompleted = updatedStops.every(s => s.status === 'completed' || s.status === 'skipped');
        const newStatus = allCompleted ? 'completed' : route.status;
        
        const updatedRoute = { 
          ...route, 
          stops: updatedStops,
          status: newStatus
        };
        
        setRoutes(prev => prev.map(r => r.id === routeId ? updatedRoute : r));
        return updatedRoute;
      }
      
      throw new Error('Route not found');
    } catch (error) {
      throw error;
    }
  };

  const getDisposalSites = () => {
    return disposalSites;
  };

  const refreshRoutes = async () => {
    await fetchRoutes();
  };

  const refreshDisposalSites = async () => {
    await fetchDisposalSites();
  };

  const value = {
    routes,
    disposalSites,
    isLoading,
    error,
    getRouteById,
    getRoutesByCollectorId,
    createRoute,
    updateRouteStatus,
    updateStopStatus,
    getDisposalSites,
    refreshRoutes,
    refreshDisposalSites
  };

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
};