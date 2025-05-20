export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'client' | 'collector';
  createdAt: Date;
}

export interface Client extends User {
  type: 'client';
  requests: PickupRequest[];
}

export interface Collector extends User {
  type: 'collector';
  vehicle: Vehicle;
  supportedWasteTypes: WasteType[];
  proposals: Proposal[];
  routes: Route[];
  rating: number;
  completedJobs: number;
}

export interface Vehicle {
  type: 'van' | 'trailer' | 'truck';
  capacity: {
    volume: number; // cubic meters
    weight: number; // kilograms
  };
  licensePlate?: string;
}

export type WasteType = 
  | 'furniture' 
  | 'appliances' 
  | 'electronics' 
  | 'rubble' 
  | 'green_waste'
  | 'household';

export interface PickupRequest {
  id: string;
  clientId: string;
  status: 'pending' | 'matched' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  wasteType: WasteType[];
  volume: number; // cubic meters
  weight?: number; // kilograms
  photos: string[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  availabilityWindows: {
    start: Date;
    end: Date;
  }[];
  description?: string;
  createdAt: Date;
  proposals: Proposal[];
}

export interface Proposal {
  id: string;
  requestId: string;
  collectorId: string;
  price: number;
  scheduledTime: {
    start: Date;
    end: Date;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
}

export interface DisposalSite {
  id: string;
  name: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  openingHours: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    hours: {
      open: string; // HH:MM format
      close: string; // HH:MM format
    }[];
  }[];
  acceptedWasteTypes: WasteType[];
}

export interface Route {
  id: string;
  collectorId: string;
  stops: RouteStop[];
  disposalSiteId: string;
  distance: number; // kilometers
  duration: number; // minutes
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface RouteStop {
  requestId: string;
  order: number;
  estimatedArrival: Date;
  status: 'pending' | 'completed' | 'skipped';
}

// Mock data interfaces
export interface MockData {
  clients: Client[];
  collectors: Collector[];
  requests: PickupRequest[];
  proposals: Proposal[];
  disposalSites: DisposalSite[];
  routes: Route[];
}