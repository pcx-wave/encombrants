import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { testAccounts } from '../../data/testAccounts';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAccountClick = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm">
            {error}
          </div>
        )}

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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-5 h-5" />}
        >
          Sign In
        </Button>

        {/* Test Accounts Quick Access */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Test Accounts</h3>
          <div className="mt-4 space-y-4">
            {Object.entries(testAccounts).map(([role, account]) => (
              <button
                key={role}
                type="button"
                onClick={() => handleTestAccountClick(account.email, account.password)}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="font-medium text-gray-900 capitalize">{role}</div>
                <div className="text-sm text-gray-600">Email: {account.email}</div>
                <div className="text-sm text-gray-600">Password: {account.password}</div>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;