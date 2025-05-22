import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Calendar, Camera, Info } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import WasteTypeIcon, { getAllWasteTypes } from '../../components/common/WasteTypeIcon';
import { WasteType } from '../../types';
import { useRequest } from '../../contexts/RequestContext';
import { useAuth } from '../../contexts/AuthContext';

const NewRequest: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [selectedTypes, setSelectedTypes] = useState<WasteType[]>([]);
  const [volume, setVolume] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [availabilityDates, setAvailabilityDates] = useState<string[]>(['']);
  const [availabilityTimes, setAvailabilityTimes] = useState<{ start: string; end: string }[]>([
    { start: '09:00', end: '17:00' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a request');
      return;
    }

    if (selectedTypes.length === 0) {
      setError('Please select at least one waste type');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const availabilityWindows = availabilityDates.map((date, index) => ({
      start: new Date(`${date}T${availabilityTimes[index].start}`).toISOString(),
      end: new Date(`${date}T${availabilityTimes[index].end}`).toISOString()
    }));

    try {
      const requestData = {
        clientId: currentUser.id,
        wasteType: selectedTypes,
        volume: parseFloat(volume),
        weight: weight ? parseFloat(weight) : undefined,
        photos,
        location: {
          address: currentUser.address || '',
          lat: 48.8566, // Example coordinates for Paris
          lng: 2.3522
        },
        availabilityWindows,
        description
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create request');
      }

      navigate('/client/requests');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAvailabilityWindow = () => {
    setAvailabilityDates([...availabilityDates, '']);
    setAvailabilityTimes([...availabilityTimes, { start: '09:00', end: '17:00' }]);
  };

  const removeAvailabilityWindow = (index: number) => {
    setAvailabilityDates(dates => dates.filter((_, i) => i !== index));
    setAvailabilityTimes(times => times.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In a real app, you would upload these to a storage service
    // For now, we'll just use local URLs
    const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
    setPhotos([...photos, ...newPhotos]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card title="New Pickup Request" className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Waste Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Package className="w-5 h-5 mr-2 text-emerald-600" />
              What type of waste do you need to dispose of?
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getAllWasteTypes().map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedTypes(prev =>
                    prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                  )}
                  className={`p-4 rounded-lg border ${
                    selectedTypes.includes(type)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200'
                  } transition-colors`}
                >
                  <WasteTypeIcon type={type} size={24} withLabel />
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Info className="w-5 h-5 mr-2 text-emerald-600" />
              Size and Weight
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="volume" className="block text-sm font-medium text-gray-700">
                  Volume (m³)
                </label>
                <input
                  type="number"
                  id="volume"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  min="0"
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                  Weight (kg, optional)
                </label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Camera className="w-5 h-5 mr-2 text-emerald-600" />
              Photos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={photo}
                    alt={`Waste item ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <Camera className="w-8 h-8 mx-auto text-gray-400" />
                  <span className="mt-2 block text-sm text-gray-600">Add Photos</span>
                </div>
              </label>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
              When are you available?
            </h3>
            {availabilityDates.map((date, index) => (
              <div key={index} className="flex items-center space-x-4">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setAvailabilityDates(dates => 
                    dates.map((d, i) => i === index ? e.target.value : d)
                  )}
                  className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
                <input
                  type="time"
                  value={availabilityTimes[index].start}
                  onChange={(e) => setAvailabilityTimes(times =>
                    times.map((t, i) => i === index ? { ...t, start: e.target.value } : t)
                  )}
                  className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
                <span>to</span>
                <input
                  type="time"
                  value={availabilityTimes[index].end}
                  onChange={(e) => setAvailabilityTimes(times =>
                    times.map((t, i) => i === index ? { ...t, end: e.target.value } : t)
                  )}
                  className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeAvailabilityWindow(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addAvailabilityWindow}
            >
              Add Another Time Window
            </Button>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Info className="w-5 h-5 mr-2 text-emerald-600" />
              Additional Details
            </h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Describe the items you need to dispose of..."
            />
          </div>

          <Button 
            type="submit" 
            fullWidth 
            size="lg"
            isLoading={isSubmitting}
          >
            Submit Request
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default NewRequest;