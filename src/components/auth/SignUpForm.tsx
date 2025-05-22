import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Truck, Package, Building } from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signUp(email, password, name, role);
      navigate('/');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          I want to...
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`p-4 rounded-lg border text-left ${
              role === 'client'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-emerald-200'
            } transition-colors`}
          >
            <Package className="w-6 h-6 text-emerald-600 mb-2" />
            <div className="font-medium">Request Pickup</div>
            <div className="text-sm text-gray-600">
              I have waste to dispose of
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole('collector')}
            className={`p-4 rounded-lg border text-left ${
              role === 'collector'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-emerald-200'
            } transition-colors`}
          >
            <Truck className="w-6 h-6 text-emerald-600 mb-2" />
            <div className="font-medium">Collect Waste</div>
            <div className="text-sm text-gray-600">
              I have a vehicle for collection
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole('deposit')}
            className={`p-4 rounded-lg border text-left ${
              role === 'deposit'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-emerald-200'
            } transition-colors`}
          >
            <Building className="w-6 h-6 text-emerald-600 mb-2" />
            <div className="font-medium">Accept Waste</div>
            <div className="text-sm text-gray-600">
              I manage a disposal site
            </div>
          </button>
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={isLoading}
        leftIcon={<UserPlus className="w-5 h-5" />}
      >
        Create Account
      </Button>
    </form>
  );
};

export default SignUpForm;