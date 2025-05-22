import React from 'react';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm';
import { testAccounts } from '../../data/testAccounts';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Truck className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />

          {/* Test Accounts Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Test Accounts</h3>
            <div className="mt-4 space-y-4 text-sm text-gray-600">
              {Object.entries(testAccounts).map(([role, account]) => (
                <div key={role} className="bg-gray-50 p-3 rounded-md">
                  <div className="font-medium text-gray-900 capitalize">{role}</div>
                  <div>Email: {account.email}</div>
                  <div>Password: {account.password}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-500">
              These accounts are for testing purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;