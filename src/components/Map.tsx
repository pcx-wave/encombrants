import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PickupRequest } from '../types';
import L from 'leaflet';
import WasteTypeIcon from './common/WasteTypeIcon';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  requests: PickupRequest[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (request: PickupRequest) => void;
}

const Map: React.FC<MapProps> = ({ 
  requests, 
  center = [48.8566, 2.3522], // Default to Paris
  zoom = 12,
  height = '400px',
  onMarkerClick 
}) => {
  return (
    <div className="rounded-lg overflow-hidden" style={{ height }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
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
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(request)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-medium text-gray-900">
                  {request.description || `${request.volume}m³ of waste`}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {request.wasteType.map(type => (
                    <WasteTypeIcon key={type} type={type} size={20} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {request.location.address}
                </p>
                <p className="text-sm text-gray-600">
                  Volume: {request.volume}m³
                  {request.weight && ` • Weight: ${request.weight}kg`}
                </p>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'matched'
                      ? 'bg-blue-100 text-blue-800'
                      : request.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;