import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Route, RouteStop, DisposalSite, WasteType } from '../types';
import mockData from '../data/mockData';

interface RouteContextType {
  routes: Route[];
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
  findBestDisposalSite: (wasteTypes: WasteType[], location: { lat: number; lng: number }) => DisposalSite;
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
  const [routes, setRoutes] = useState<Route[]>(mockData.routes);
  const [disposalSites] = useState<DisposalSite[]>(mockData.disposalSites);

  const getRouteById = (id: string) => {
    return routes.find(route => route.id === id);
  };

  const getRoutesByCollectorId = (collectorId: string) => {
    return routes.filter(route => route.collectorId === collectorId);
  };

  // Find the best disposal site based on waste types and proximity
  const findBestDisposalSite = (wasteTypes: WasteType[], location: { lat: number; lng: number }): DisposalSite => {
    // Filter sites that accept all the waste types
    const compatibleSites = disposalSites.filter(site => 
      wasteTypes.every(type => site.acceptedWasteTypes.includes(type))
    );
    
    if (compatibleSites.length === 0) {
      // If no site accepts all waste types, return the first site as fallback
      return disposalSites[0];
    }
    
    // Calculate distance (simplified version using Euclidean distance)
    // In a real app, you would use a routing API to get actual driving distances
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
    };
    
    // Find the closest compatible site
    let closestSite = compatibleSites[0];
    let minDistance = calculateDistance(
      location.lat, location.lng, 
      closestSite.location.lat, closestSite.location.lng
    );
    
    for (let i = 1; i < compatibleSites.length; i++) {
      const site = compatibleSites[i];
      const distance = calculateDistance(
        location.lat, location.lng, 
        site.location.lat, site.location.lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSite = site;
      }
    }
    
    return closestSite;
  };

  // Compute routes with optimization
  const createRoute = async (
    collectorId: string,
    requestIds: string[],
    startTime: Date
  ): Promise<Route> => {
    return new Promise((resolve) => {
      // Simulate API delay for route calculation
      setTimeout(() => {
        // Get the collector
        const collector = mockData.collectors.find(c => c.id === collectorId);
        if (!collector) throw new Error('Collector not found');
        
        // Get all the requests
        const requestsToRoute = mockData.requests.filter(r => requestIds.includes(r.id));
        if (requestsToRoute.length === 0) throw new Error('No valid requests found');
        
        // Calculate route duration (simplified)
        const averageTimePerStop = 30; // minutes
        const averageDrivingTime = 15; // minutes between stops
        
        // Create route stops
        const stops: RouteStop[] = requestsToRoute.map((request, index) => {
          // Calculate estimated arrival time (simplified)
          const estimatedArrival = new Date(startTime);
          estimatedArrival.setMinutes(
            estimatedArrival.getMinutes() + index * (averageTimePerStop + averageDrivingTime)
          );
          
          return {
            requestId: request.id,
            order: index + 1,
            estimatedArrival,
            status: 'pending'
          };
        });
        
        // Calculate the total distance and duration
        const totalDuration = stops.length * (averageTimePerStop + averageDrivingTime);
        const averageSpeedKmh = 30; // km/h in urban areas
        const totalDistance = (totalDuration / 60) * averageSpeedKmh;
        
        // Determine end location (last pickup)
        const lastRequest = requestsToRoute[requestsToRoute.length - 1];
        const lastLocation = lastRequest.location;
        
        // Determine waste types to dispose
        const allWasteTypes = requestsToRoute.flatMap(r => r.wasteType);
        const uniqueWasteTypes = [...new Set(allWasteTypes)] as WasteType[];
        
        // Find best disposal site
        const bestDisposalSite = findBestDisposalSite(uniqueWasteTypes, lastLocation);
        
        // Calculate end time
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + totalDuration + 30); // Add 30 min for disposal site
        
        // Create the new route
        const newRoute: Route = {
          id: `route-${Date.now()}`,
          collectorId,
          stops,
          disposalSiteId: bestDisposalSite.id,
          distance: parseFloat(totalDistance.toFixed(1)),
          duration: totalDuration,
          startTime,
          endTime,
          status: 'scheduled'
        };
        
        setRoutes(prev => [...prev, newRoute]);
        resolve(newRoute);
      }, 1000);
    });
  };

  // Update route status
  const updateRouteStatus = async (
    routeId: string, 
    status: Route['status']
  ): Promise<Route> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const routeIndex = routes.findIndex(r => r.id === routeId);
        if (routeIndex === -1) {
          reject(new Error('Route not found'));
          return;
        }
        
        const updatedRoute = { ...routes[routeIndex], status };
        const newRoutes = [...routes];
        newRoutes[routeIndex] = updatedRoute;
        
        setRoutes(newRoutes);
        resolve(updatedRoute);
      }, 300);
    });
  };

  // Update a stop's status within a route
  const updateStopStatus = async (
    routeId: string,
    requestId: string,
    status: RouteStop['status']
  ): Promise<Route> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const routeIndex = routes.findIndex(r => r.id === routeId);
        if (routeIndex === -1) {
          reject(new Error('Route not found'));
          return;
        }
        
        const route = routes[routeIndex];
        const stopIndex = route.stops.findIndex(s => s.requestId === requestId);
        if (stopIndex === -1) {
          reject(new Error('Stop not found in route'));
          return;
        }
        
        // Update the stop
        const newStops = [...route.stops];
        newStops[stopIndex] = { ...newStops[stopIndex], status };
        
        // Create updated route
        const updatedRoute = { ...route, stops: newStops };
        
        // Check if all stops are completed/skipped and update route status if needed
        const allStopsHandled = newStops.every(s => s.status === 'completed' || s.status === 'skipped');
        if (allStopsHandled && updatedRoute.status === 'in_progress') {
          updatedRoute.status = 'completed';
        }
        
        // Update routes state
        const newRoutes = [...routes];
        newRoutes[routeIndex] = updatedRoute;
        setRoutes(newRoutes);
        
        resolve(updatedRoute);
      }, 300);
    });
  };

  const getDisposalSites = () => {
    return disposalSites;
  };

  const value = {
    routes,
    getRouteById,
    getRoutesByCollectorId,
    createRoute,
    updateRouteStatus,
    updateStopStatus,
    getDisposalSites,
    findBestDisposalSite
  };

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
};