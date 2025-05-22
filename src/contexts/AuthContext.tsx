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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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
          try {
            await loadUser(session.user);
          } catch (error) {
            console.error('Error in auth state change:', error);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUser(session.user).catch((error) => {
          console.error('Error loading initial session:', error);
          setCurrentUser(null);
        });
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async (authUser: SupabaseUser, retryCount = 3): Promise<void> => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116' && retryCount > 0) {
          // Wait for 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadUser(authUser, retryCount - 1);
        }
        throw error;
      }

      if (!userData) {
        throw new Error('User record not found in database');
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
          throw new Error('Invalid email or password');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from authentication');
      }

      // Wait for a short delay to ensure the user profile is available
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        await loadUser(data.user);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error('User profile not found. Please contact support.');
        }
        throw error;
      }
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

      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email,
            name,
            type: role
          });

        if (profileError) {
          await supabase.auth.admin.deleteUser(user.id);
          throw profileError;
        }

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

          if (collectorError) {
            await supabase.auth.admin.deleteUser(user.id);
            await supabase.from('users').delete().eq('id', user.id);
            throw collectorError;
          }
        }

        // Wait for a short delay to ensure all database operations are complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error creating user profile:', error);
        await supabase.auth.admin.deleteUser(user.id);
        throw error;
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