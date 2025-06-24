import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Mail, Save, Truck } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import WasteTypeIcon, { getAllWasteTypes } from '../components/common/WasteTypeIcon';
import { useAuth } from '../contexts/AuthContext';
import { WasteType } from '../types';

interface CollectorProfile {
  vehicle_type: 'van' | 'trailer' | 'truck';
  vehicle_capacity_volume: number;
  vehicle_capacity_weight: number;
  vehicle_license_plate: string;
  supported_waste_types: WasteType[];
  rating: number;
  completed_jobs: number;
}

const ProfilePage: React.FC = () => {
  const { currentUser, isCollector } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [collectorProfile, setCollectorProfile] = useState<CollectorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isCollector) {
      fetchCollectorProfile();
    }
  }, [isCollector]);

  const fetchCollectorProfile = async () => {
    try {
      setIsLoading(true);
      const token = (await import('../utils/supabaseClient')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);
      const authToken = await token;
      
      if (!authToken) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/collector/profile', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch collector profile');
      }

      const data = await response.json();
      setCollectorProfile(data);
    } catch (error) {
      console.error('Error fetching collector profile:', error);
      setError('Failed to load collector profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const token = (await import('../utils/supabaseClient')).supabase.auth.getSession().then(({ data }) => data.session?.access_token);
      const authToken = await token;
      
      if (!authToken) {
        throw new Error('No authentication token');
      }

      // Update user profile
      const userResponse = await fetch('/api/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, address })
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      // Update collector profile if applicable
      if (isCollector && collectorProfile) {
        const collectorResponse = await fetch('/api/collector/profile', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(collectorProfile)
        });

        if (!collectorResponse.ok) {
          const errorData = await collectorResponse.json();
          throw new Error(errorData.error || 'Failed to update collector profile');
        }
      }

      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const updateCollectorProfile = (field: keyof CollectorProfile, value: any) => {
    if (!collectorProfile) return;
    setCollectorProfile({ ...collectorProfile, [field]: value });
  };

  const toggleWasteType = (type: WasteType) => {
    if (!collectorProfile) return;
    const currentTypes = collectorProfile.supported_waste_types;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateCollectorProfile('supported_waste_types', newTypes);
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">Please log in to view your profile.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
            {success}
          </div>
        )}

        {/* Basic Information */}
        <Card title="Basic Information" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                id="email"
                value={currentUser.email}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
        </Card>

        {/* Collector-specific settings */}
        {isCollector && (
          <Card 
            title="Collector Settings" 
            subtitle="Manage your vehicle and service information"
            isLoading={isLoading}
          >
            {collectorProfile && (
              <div className="space-y-6">
                {/* Vehicle Information */}
                <div>
                  <h3 className="text-lg font-semibold flex items-center mb-4">
                    <Truck className="w-5 h-5 mr-2 text-emerald-600" />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                      <select
                        value={collectorProfile.vehicle_type}
                        onChange={(e) => updateCollectorProfile('vehicle_type', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      >
                        <option value="van">Van</option>
                        <option value="trailer">Trailer</option>
                        <option value="truck">Truck</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">License Plate</label>
                      <input
                        type="text"
                        value={collectorProfile.vehicle_license_plate}
                        onChange={(e) => updateCollectorProfile('vehicle_license_plate', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Capacity Volume (m³)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={collectorProfile.vehicle_capacity_volume}
                        onChange={(e) => updateCollectorProfile('vehicle_capacity_volume', parseFloat(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Capacity Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        value={collectorProfile.vehicle_capacity_weight}
                        onChange={(e) => updateCollectorProfile('vehicle_capacity_weight', parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Supported Waste Types */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Supported Waste Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {getAllWasteTypes().map(({ type, label }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleWasteType(type)}
                        className={`p-4 rounded-lg border ${
                          collectorProfile.supported_waste_types.includes(type)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-200'
                        } transition-colors`}
                      >
                        <WasteTypeIcon type={type} size={24} withLabel />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{collectorProfile.rating}/5</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Completed Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">{collectorProfile.completed_jobs}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveProfile}
            isLoading={isSaving}
            leftIcon={<Save className="w-5 h-5" />}
            size="lg"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;