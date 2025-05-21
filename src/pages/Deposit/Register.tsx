import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Package, Euro } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { WasteType } from '../../types';
import WasteTypeIcon, { getAllWasteTypes } from '../../components/common/WasteTypeIcon';

interface OpeningHours {
  day: string;
  open: string;
  close: string;
}

const DepositRegister: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<WasteType[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([
    { day: 'Monday', open: '09:00', close: '17:00' },
    { day: 'Tuesday', open: '09:00', close: '17:00' },
    { day: 'Wednesday', open: '09:00', close: '17:00' },
    { day: 'Thursday', open: '09:00', close: '17:00' },
    { day: 'Friday', open: '09:00', close: '17:00' },
    { day: 'Saturday', open: '09:00', close: '13:00' },
    { day: 'Sunday', open: '', close: '' },
  ]);
  const [paymentEnabled, setPaymentEnabled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to backend
    navigate('/deposit/dashboard');
  };

  const toggleWasteType = (type: WasteType) => {
    setSelectedWasteTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const updateOpeningHours = (
    index: number,
    field: 'open' | 'close',
    value: string
  ) => {
    const newHours = [...openingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setOpeningHours(newHours);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card title="Register as a Deposit Point" className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
              Basic Information
            </h3>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Facility Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Accepted Waste Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Package className="w-5 h-5 mr-2 text-emerald-600" />
              Accepted Waste Types
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getAllWasteTypes().map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleWasteType(type)}
                  className={`p-4 rounded-lg border ${
                    selectedWasteTypes.includes(type)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200'
                  } transition-colors`}
                >
                  <WasteTypeIcon type={type} size={24} withLabel />
                </button>
              ))}
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-emerald-600" />
              Opening Hours
            </h3>
            <div className="space-y-3">
              {openingHours.map((hours, index) => (
                <div key={hours.day} className="grid grid-cols-3 gap-4 items-center">
                  <div className="font-medium">{hours.day}</div>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => updateOpeningHours(index, 'open', e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => updateOpeningHours(index, 'close', e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Euro className="w-5 h-5 mr-2 text-emerald-600" />
              Payment Settings
            </h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="paymentEnabled"
                checked={paymentEnabled}
                onChange={(e) => setPaymentEnabled(e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="paymentEnabled" className="ml-2 block text-sm text-gray-700">
                Enable payments for specific items
              </label>
            </div>
            {paymentEnabled && (
              <div className="pl-6">
                <p className="text-sm text-gray-600 mb-2">
                  You'll be able to set prices for specific items after registration
                </p>
              </div>
            )}
          </div>

          <Button type="submit" fullWidth size="lg">
            Complete Registration
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default DepositRegister;