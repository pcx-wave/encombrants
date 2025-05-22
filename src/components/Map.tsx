import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PickupRequest } from '../types';
import L from 'leaflet';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  requests: PickupRequest[];
}

const Map: React.FC<MapProps> = ({ requests }) => {
  const position: [number, number] = [48.8566, 2.3522]; // Default to Paris

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden mb-6">
      <MapContainer 
        center={position} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {requests.map(request => (
          <Marker 
            key={request.id} 
            position={[request.location.lat, request.location.lng]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-medium text-gray-900">
                  {request.description || `${request.volume}m³ of waste`}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {request.location.address}
                </p>
                <p className="text-sm text-gray-600">
                  Volume: {request.volume}m³
                  {request.weight && ` • Weight: ${request.weight}kg`}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;