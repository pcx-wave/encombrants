import React from 'react';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import SignUpForm from '../../components/auth/SignUpForm';
import { testAccounts } from '../../data/testAccounts';

const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Truck className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUpForm />

          {/* Test Accounts Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Test Accounts Available</h3>
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
              These accounts are for testing purposes only. You can use them to test different roles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;