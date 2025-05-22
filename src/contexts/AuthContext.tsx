import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { AuthUser, UserRole } from '../types/auth';

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isClient: boolean;
  isCollector: boolean;
  isDeposit: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<AuthUser, 'id' | 'email' | 'role'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUser(session.user);
        } else {
          setCurrentUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUser(session.user);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async (authUser: SupabaseUser) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (userData) {
        setCurrentUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.type,
          phone: userData.phone || undefined,
          address: userData.address || undefined,
          createdAt: new Date(userData.created_at || Date.now())
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setCurrentUser(null);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          throw new Error('This email is already registered. Please try logging in instead.');
        }
        throw signUpError;
      }
      
      if (!user) throw new Error('User creation failed');

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email,
          name,
          type: role
        });

      if (profileError) throw profileError;

      // If user is a collector, create collector profile
      if (role === 'collector') {
        const { error: collectorError } = await supabase
          .from('collectors')
          .insert({
            id: user.id,
            vehicle_type: 'van', // Default values, can be updated later
            vehicle_capacity_volume: 10,
            vehicle_capacity_weight: 1000,
            supported_waste_types: ['furniture', 'household'] // Default values
          });

        if (collectorError) throw collectorError;
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Handle specific error cases
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before logging in.');
        } else if (error.message.includes('rate limit')) {
          throw new Error('Too many login attempts. Please try again later.');
        } else {
          throw new Error('An error occurred during sign in. Please try again.');
        }
      }

      if (!data.user) {
        throw new Error('No user data returned after successful login.');
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw new Error(error.message);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred during sign in.');
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Omit<AuthUser, 'id' | 'email' | 'role'>>) => {
    if (!currentUser) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isClient: currentUser?.role === 'client',
    isCollector: currentUser?.role === 'collector',
    isDeposit: currentUser?.role === 'deposit',
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};