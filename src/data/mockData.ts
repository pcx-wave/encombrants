import { Client, Collector, DisposalSite, MockData, PickupRequest, Proposal, Route, WasteType } from '../types';

// Helper function to generate a random ID
const generateId = (): string => Math.random().toString(36).substring(2, 15);

// Helper function to generate a random date within the next 7 days
const generateFutureDate = (daysAhead = 7): Date => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  return date;
};

// Helper function to generate a random time window
const generateTimeWindow = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  start.setHours(8 + Math.floor(Math.random() * 8), 0, 0, 0); // Between 8 AM and 4 PM
  
  const end = new Date(start);
  end.setHours(start.getHours() + 2 + Math.floor(Math.random() * 4)); // 2-6 hours after start
  
  return { start, end };
};

// Mock Clients
const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Emma Martin',
    email: 'emma.martin@example.com',
    phone: '06 12 34 56 78',
    address: '15 Rue de la Paix, Paris',
    type: 'client',
    createdAt: new Date('2023-01-15'),
    requests: []
  },
  {
    id: 'client-2',
    name: 'Thomas Dubois',
    email: 'thomas.dubois@example.com',
    phone: '06 23 45 67 89',
    address: '8 Rue Victor Hugo, Lyon',
    type: 'client',
    createdAt: new Date('2023-02-20'),
    requests: []
  },
  {
    id: 'client-3',
    name: 'Sophie Lefebvre',
    email: 'sophie.lefebvre@example.com',
    phone: '06 34 56 78 90',
    address: '22 Avenue Jean Jaurès, Bordeaux',
    type: 'client',
    createdAt: new Date('2023-03-10'),
    requests: []
  }
];

// Mock Collectors
const mockCollectors: Collector[] = [
  {
    id: 'collector-1',
    name: 'Lucas Bernard',
    email: 'lucas.bernard@example.com',
    phone: '06 45 67 89 01',
    address: '5 Rue des Lilas, Marseille',
    type: 'collector',
    createdAt: new Date('2023-01-10'),
    vehicle: {
      type: 'van',
      capacity: {
        volume: 12,
        weight: 1500
      },
      licensePlate: 'AB-123-CD'
    },
    supportedWasteTypes: ['furniture', 'appliances', 'electronics', 'household'],
    proposals: [],
    routes: [],
    rating: 4.8,
    completedJobs: 42
  },
  {
    id: 'collector-2',
    name: 'Julie Moreau',
    email: 'julie.moreau@example.com',
    phone: '06 56 78 90 12',
    address: '10 Boulevard Voltaire, Nice',
    type: 'collector',
    createdAt: new Date('2023-02-05'),
    vehicle: {
      type: 'trailer',
      capacity: {
        volume: 8,
        weight: 1000
      },
      licensePlate: 'EF-456-GH'
    },
    supportedWasteTypes: ['furniture', 'green_waste', 'household'],
    proposals: [],
    routes: [],
    rating: 4.6,
    completedJobs: 28
  },
  {
    id: 'collector-3',
    name: 'Antoine Durand',
    email: 'antoine.durand@example.com',
    phone: '06 67 89 01 23',
    address: '3 Rue Gambetta, Toulouse',
    type: 'collector',
    createdAt: new Date('2023-03-01'),
    vehicle: {
      type: 'truck',
      capacity: {
        volume: 20,
        weight: 3000
      },
      licensePlate: 'IJ-789-KL'
    },
    supportedWasteTypes: ['furniture', 'appliances', 'electronics', 'rubble', 'green_waste', 'household'],
    proposals: [],
    routes: [],
    rating: 4.9,
    completedJobs: 65
  }
];

// Mock Disposal Sites
const mockDisposalSites: DisposalSite[] = [
  {
    id: 'site-1',
    name: 'Paris North Recycling Center',
    location: {
      address: '25 Rue de la République, Paris',
      lat: 48.864716,
      lng: 2.349014
    },
    openingHours: [
      {
        day: 'monday',
        hours: [{ open: '08:00', close: '17:00' }]
      },
      {
        day: 'tuesday',
        hours: [{ open: '08:00', close: '17:00' }]
      },
      {
        day: 'wednesday',
        hours: [{ open: '08:00', close: '17:00' }]
      },
      {
        day: 'thursday',
        hours: [{ open: '08:00', close: '17:00' }]
      },
      {
        day: 'friday',
        hours: [{ open: '08:00', close: '17:00' }]
      },
      {
        day: 'saturday',
        hours: [{ open: '09:00', close: '16:00' }]
      },
      {
        day: 'sunday',
        hours: []
      }
    ],
    acceptedWasteTypes: ['furniture', 'appliances', 'electronics', 'household']
  },
  {
    id: 'site-2',
    name: 'Lyon Central Waste Management',
    location: {
      address: '12 Rue Bellecour, Lyon',
      lat: 45.760399,
      lng: 4.836143
    },
    openingHours: [
      {
        day: 'monday',
        hours: [{ open: '09:00', close: '18:00' }]
      },
      {
        day: 'tuesday',
        hours: [{ open: '09:00', close: '18:00' }]
      },
      {
        day: 'wednesday',
        hours: [{ open: '09:00', close: '18:00' }]
      },
      {
        day: 'thursday',
        hours: [{ open: '09:00', close: '18:00' }]
      },
      {
        day: 'friday',
        hours: [{ open: '09:00', close: '18:00' }]
      },
      {
        day: 'saturday',
        hours: [{ open: '10:00', close: '17:00' }]
      },
      {
        day: 'sunday',
        hours: []
      }
    ],
    acceptedWasteTypes: ['furniture', 'appliances', 'electronics', 'rubble', 'green_waste', 'household']
  },
  {
    id: 'site-3',
    name: 'Bordeaux Construction Waste Facility',
    location: {
      address: '8 Quai des Chartrons, Bordeaux',
      lat: 44.843792,
      lng: -0.570650
    },
    openingHours: [
      {
        day: 'monday',
        hours: [{ open: '08:30', close: '16:30' }]
      },
      {
        day: 'tuesday',
        hours: [{ open: '08:30', close: '16:30' }]
      },
      {
        day: 'wednesday',
        hours: [{ open: '08:30', close: '16:30' }]
      },
      {
        day: 'thursday',
        hours: [{ open: '08:30', close: '16:30' }]
      },
      {
        day: 'friday',
        hours: [{ open: '08:30', close: '16:30' }]
      },
      {
        day: 'saturday',
        hours: [{ open: '09:00', close: '15:00' }]
      },
      {
        day: 'sunday',
        hours: []
      }
    ],
    acceptedWasteTypes: ['rubble', 'green_waste']
  }
];

// Generate Mock Pickup Requests
const mockRequests: PickupRequest[] = [
  {
    id: 'request-1',
    clientId: 'client-1',
    status: 'pending',
    wasteType: ['furniture', 'household'],
    volume: 2.5,
    weight: 150,
    photos: [
      'https://images.pexels.com/photos/4792288/pexels-photo-4792288.jpeg',
      'https://images.pexels.com/photos/4792286/pexels-photo-4792286.jpeg'
    ],
    location: {
      address: '15 Rue de la Paix, Paris',
      lat: 48.869809,
      lng: 2.329773
    },
    availabilityWindows: [
      generateTimeWindow(generateFutureDate()),
      generateTimeWindow(generateFutureDate(3))
    ],
    description: 'Old sofa and coffee table to dispose of after renovations',
    createdAt: new Date('2023-05-15'),
    proposals: []
  },
  {
    id: 'request-2',
    clientId: 'client-2',
    status: 'matched',
    wasteType: ['appliances', 'electronics'],
    volume: 1.8,
    weight: 100,
    photos: [
      'https://images.pexels.com/photos/5561913/pexels-photo-5561913.jpeg',
      'https://images.pexels.com/photos/4458522/pexels-photo-4458522.jpeg'
    ],
    location: {
      address: '8 Rue Victor Hugo, Lyon',
      lat: 45.753387,
      lng: 4.828622
    },
    availabilityWindows: [
      generateTimeWindow(generateFutureDate(2)),
      generateTimeWindow(generateFutureDate(5))
    ],
    description: 'Old washing machine and TV for disposal',
    createdAt: new Date('2023-05-18'),
    proposals: []
  },
  {
    id: 'request-3',
    clientId: 'client-3',
    status: 'pending',
    wasteType: ['rubble', 'green_waste'],
    volume: 3.2,
    weight: 800,
    photos: [
      'https://images.pexels.com/photos/3635068/pexels-photo-3635068.jpeg',
      'https://images.pexels.com/photos/5591489/pexels-photo-5591489.jpeg'
    ],
    location: {
      address: '22 Avenue Jean Jaurès, Bordeaux',
      lat: 44.840329,
      lng: -0.569332
    },
    availabilityWindows: [
      generateTimeWindow(generateFutureDate(1)),
      generateTimeWindow(generateFutureDate(4))
    ],
    description: 'Construction waste and garden trimmings from backyard renovation',
    createdAt: new Date('2023-05-20'),
    proposals: []
  }
];

// Generate Mock Proposals
const mockProposals: Proposal[] = [
  {
    id: 'proposal-1',
    requestId: 'request-1',
    collectorId: 'collector-1',
    price: 75,
    scheduledTime: generateTimeWindow(mockRequests[0].availabilityWindows[0].start),
    status: 'pending',
    createdAt: new Date('2023-05-16')
  },
  {
    id: 'proposal-2',
    requestId: 'request-1',
    collectorId: 'collector-2',
    price: 90,
    scheduledTime: generateTimeWindow(mockRequests[0].availabilityWindows[1].start),
    status: 'pending',
    createdAt: new Date('2023-05-16')
  },
  {
    id: 'proposal-3',
    requestId: 'request-2',
    collectorId: 'collector-1',
    price: 65,
    scheduledTime: generateTimeWindow(mockRequests[1].availabilityWindows[0].start),
    status: 'accepted',
    createdAt: new Date('2023-05-19')
  },
  {
    id: 'proposal-4',
    requestId: 'request-3',
    collectorId: 'collector-3',
    price: 120,
    scheduledTime: generateTimeWindow(mockRequests[2].availabilityWindows[0].start),
    status: 'pending',
    createdAt: new Date('2023-05-21')
  }
];

// Link requests and proposals
mockRequests[0].proposals = [mockProposals[0].id, mockProposals[1].id];
mockRequests[1].proposals = [mockProposals[2].id];
mockRequests[2].proposals = [mockProposals[3].id];

// Link collectors and proposals
mockCollectors[0].proposals = [mockProposals[0].id, mockProposals[2].id];
mockCollectors[1].proposals = [mockProposals[1].id];
mockCollectors[2].proposals = [mockProposals[3].id];

// Mock Routes
const mockRoutes: Route[] = [
  {
    id: 'route-1',
    collectorId: 'collector-1',
    stops: [
      {
        requestId: 'request-1',
        order: 1,
        estimatedArrival: mockProposals[0].scheduledTime.start,
        status: 'pending'
      },
      {
        requestId: 'request-2',
        order: 2,
        estimatedArrival: new Date(mockProposals[0].scheduledTime.start.getTime() + 60 * 60 * 1000), // 1 hour later
        status: 'pending'
      }
    ],
    disposalSiteId: 'site-1',
    distance: 15.3,
    duration: 45,
    startTime: new Date(mockProposals[0].scheduledTime.start.getTime() - 30 * 60 * 1000), // 30 minutes before first stop
    endTime: new Date(mockProposals[0].scheduledTime.start.getTime() + 3 * 60 * 60 * 1000), // 3 hours after first stop
    status: 'scheduled'
  }
];

// Link collectors and routes
mockCollectors[0].routes = [mockRoutes[0].id];

// Combine all mock data
export const mockData: MockData = {
  clients: mockClients,
  collectors: mockCollectors,
  requests: mockRequests,
  proposals: mockProposals,
  disposalSites: mockDisposalSites,
  routes: mockRoutes
};

export default mockData;