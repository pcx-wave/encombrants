import React from 'react';
import { MapPin, Package, Clock, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import WasteTypeIcon from '../../components/common/WasteTypeIcon';
import { useRoute } from '../../contexts/RouteContext';
import { useAuth } from '../../contexts/AuthContext';

const CollectorRoutes: React.FC = () => {
  const { currentUser } = useAuth();
  const { getRoutesByCollectorId } = useRoute();

  const routes = currentUser?.id ? getRoutesByCollectorId(currentUser.id) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Active Route */}
        <div className="md:col-span-2">
          <Card 
            title="Current Route" 
            subtitle="3 stops • 15.3 km • Est. 45 min"
            className="mb-8"
          >
            <div className="space-y-6">
              {routes[0]?.stops.map((stop, index) => (
                <div key={stop.requestId} className="relative">
                  {index !== routes[0].stops.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-emerald-100 rounded-full p-2">
                      <MapPin className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Stop {index + 1}</p>
                          <p className="text-sm text-gray-600">123 Example Street</p>
                        </div>
                        <Button
                          size="sm"
                          variant={stop.status === 'completed' ? 'success' : 'primary'}
                          leftIcon={stop.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : undefined}
                        >
                          {stop.status === 'completed' ? 'Completed' : 'Mark Complete'}
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {stop.estimatedArrival.toLocaleTimeString()}
                        </span>
                        <span className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          2.5m³
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

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

          {/* Route Map Placeholder */}
          <Card className="bg-gray-100 h-96 flex items-center justify-center">
            <p className="text-gray-500">Map View Coming Soon</p>
          </Card>
        </div>

        {/* Route Details */}
        <div>
          <Card title="Route Details" className="mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold">15.3 km</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Duration</p>
                <p className="text-2xl font-bold">45 min</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold">7.5 m³</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Waste Types</p>
                <div className="mt-2 flex space-x-2">
                  <WasteTypeIcon type="furniture" size={24} />
                  <WasteTypeIcon type="appliances" size={24} />
                  <WasteTypeIcon type="electronics" size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Actions" className="space-y-4">
            <Button variant="primary" fullWidth>
              Start Route
            </Button>
            <Button variant="outline" fullWidth>
              Modify Route
            </Button>
            <Button variant="danger" fullWidth>
              Cancel Route
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CollectorRoutes;