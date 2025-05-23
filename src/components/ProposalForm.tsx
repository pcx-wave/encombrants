```tsx
import React, { useState } from 'react';
import { Clock, Euro } from 'lucide-react';
import Button from './common/Button';
import { PickupRequest } from '../types';

interface ProposalFormProps {
  request: PickupRequest;
  onSubmit: () => void;
  onCancel: () => void;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ request, onSubmit, onCancel }) => {
  const [price, setPrice] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!price || !scheduledDate || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }

    const scheduledStart = new Date(`${scheduledDate}T${startTime}`);
    const scheduledEnd = new Date(`${scheduledDate}T${endTime}`);

    if (scheduledStart >= scheduledEnd) {
      setError('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId: request.id,
          price: parseFloat(price),
          scheduledStart: scheduledStart.toISOString(),
          scheduledEnd: scheduledEnd.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit proposal');
      }

      onSubmit();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price (€)
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Euro className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            id="price"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Pickup Date
        </label>
        <input
          type="date"
          id="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
        >
          Submit Proposal
        </Button>
      </div>
    </form>
  );
};

export default ProposalForm;
```