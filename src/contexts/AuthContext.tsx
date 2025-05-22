import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
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
      // First verify the user exists
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('id', authUser.id);

      if (countError) throw countError;
      
      if (count === 0) {
        console.error('User record not found in database');
        await signOut(); // Sign out if no user record exists
        throw new Error('User profile not found. Please contact support.');
      }

      // Now fetch the user data
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Failed to load user profile');
      }

      if (!userData) {
        console.error('No user data returned');
        throw new Error('User profile not found');
      }

      setCurrentUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.type,
        phone: userData.phone || undefined,
        address: userData.address || undefined,
        createdAt: new Date(userData.created_at || Date.now())
      });
    } catch (error) {
      console.error('Error loading user:', error);
      setCurrentUser(null);
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
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw new Error(`Login failed: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('Login failed: No user data returned');
      }

      // Attempt to load user data immediately after successful auth
      await loadUser(data.user);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('User creation failed');

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email,
          name,
          type: role
        });

      if (profileError) throw profileError;

      if (role === 'collector') {
        const { error: collectorError } = await supabase
          .from('collectors')
          .insert({
            id: user.id,
            vehicle_type: 'van',
            vehicle_capacity_volume: 10,
            vehicle_capacity_weight: 1000,
            supported_waste_types: ['furniture', 'household']
          });

        if (collectorError) throw collectorError;
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
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