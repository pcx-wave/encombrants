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
  logout: () => Promise<void>;
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

  const loadUser = async (authUser: SupabaseUser, retryCount = 3, retryDelay = 1000): Promise<void> => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!userData) {
        if (retryCount > 0) {
          console.log(`User profile not found, retrying... (${retryCount} attempts remaining)`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return loadUser(authUser, retryCount - 1, retryDelay * 1.5);
        }
        throw new Error('User profile not found after multiple attempts');
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
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from authentication');
      }

      // Try to load the user profile with retries
      try {
        await loadUser(data.user, 5, 1000);
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Sign out the user if we can't load their profile
        await supabase.auth.signOut();
        throw new Error('Unable to load user profile. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      if (error instanceof Error) {
        throw new Error(error.message === 'Invalid login credentials' 
          ? 'Invalid email or password' 
          : 'An error occurred during sign in. Please try again.');
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    let authUser = null;
    try {
      // Step 1: Create auth user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('User creation failed');
      
      authUser = user;

      // Step 2: Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email,
          name,
          type: role
        });

      if (profileError) {
        throw profileError;
      }

      // Step 3: Create collector profile if needed
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
          throw collectorError;
        }
      }

      // Step 4: Verify profile creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadUser(user, 5, 1000);

    } catch (error) {
      console.error('Error during sign up:', error);
      
      // Cleanup on failure
      if (authUser) {
        try {
          // Delete auth user
          await supabase.auth.admin.deleteUser(authUser.id);
          // Delete user profile if it was created
          await supabase.from('users').delete().eq('id', authUser.id);
          // Delete collector profile if it was created
          if (role === 'collector') {
            await supabase.from('collectors').delete().eq('id', authUser.id);
          }
        } catch (cleanupError) {
          console.error('Error during cleanup:', cleanupError);
        }
      }
      
      if (error instanceof Error) {
        throw new Error('Failed to create user account. Please try again.');
      }
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

  const logout = async () => {
    await signOut();
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
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};