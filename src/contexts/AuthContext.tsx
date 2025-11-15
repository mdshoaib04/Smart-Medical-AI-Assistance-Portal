import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { mockAuthService } from '../lib/mockAuth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserType } from '../types';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  signUp: (fullName: string, email: string, password: string, userType: UserType) => Promise<void>;
  signIn: (email: string, password: string, userType?: UserType) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check Supabase config immediately and set mock auth
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const initialUseMock = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project');
  const [useMockAuth, setUseMockAuth] = useState(initialUseMock);

  useEffect(() => {
    // If using mock auth, skip Supabase setup entirely
    if (useMockAuth) {
      console.log('[AuthContext] Using mock authentication mode');
      const mockSession = mockAuthService.getSession();
      if (mockSession.user) {
        setUser(mockSession.user as any);
        fetchProfile(mockSession.user.id);
      } else {
        setLoading(false);
      }
      return;
    }

    // Only run Supabase setup if properly configured
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        console.warn('Falling back to mock authentication.');
        setUseMockAuth(true);
        setLoading(false);
        return;
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Error in getSession:', error);
      console.warn('Falling back to mock authentication.');
      setUseMockAuth(true);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [useMockAuth]);

  const fetchProfile = async (userId: string) => {
    const storedProfile = localStorage.getItem('medilink_profile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const signUp = async (fullName: string, email: string, password: string, userType: UserType) => {
    try {
      // Validate inputs
      if (!email || !password || !fullName) {
        throw new Error('Please fill in all required fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if we should use mock auth (faster registration)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const shouldUseMock = useMockAuth || !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project');

      if (shouldUseMock) {
        console.log('[AuthContext] Using mock authentication for fast sign up');
        const { user: mockUser, error: mockError } = await mockAuthService.signUp(
          email,
          password,
          { full_name: fullName, user_type: userType }
        );

        if (mockError) {
          console.error('[AuthContext] Mock signup error:', mockError);
          throw mockError;
        }

        if (mockUser) {
          console.log('[AuthContext] Mock user created:', mockUser.id);
          const newProfile: User = {
            id: mockUser.id,
            full_name: fullName.trim(),
            mobile_number: email.split('@')[0],
            user_type: userType,
            preferred_language: 'english',
          };

          localStorage.setItem('medilink_profile', JSON.stringify(newProfile));
          setProfile(newProfile);
          setUser(mockUser as any);
          console.log('[AuthContext] Registration complete, profile set');
          return;
        }
      }

      // Only try Supabase if properly configured
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            user_type: userType
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        
        // Fallback to mock auth on any error
        console.warn('Supabase error, falling back to mock auth');
        setUseMockAuth(true);
        return signUp(fullName, email, password, userType);
      }

      if (data.user) {
        const mobileNumber = email.split('@')[0];
        const newProfile: User = {
          id: data.user.id,
          full_name: fullName.trim(),
          mobile_number: mobileNumber,
          user_type: userType,
          preferred_language: 'english',
        };

        localStorage.setItem('medilink_profile', JSON.stringify(newProfile));
        setProfile(newProfile);
        setUser(data.user);
      } else {
        throw new Error('Registration failed. No user data received.');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      
      // Fallback to mock auth on network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn('Network error detected, using mock authentication');
        setUseMockAuth(true);
        return signUp(fullName, email, password, userType);
      }
      
      throw err;
    }
  };

  const signIn = async (email: string, password: string, userType?: UserType) => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      // Check if we should use mock auth (faster login)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const shouldUseMock = useMockAuth || !supabaseUrl || !supabaseAnonKey;

      if (shouldUseMock) {
        console.log('Using mock authentication for sign in');
        const { user: mockUser, error: mockError } = await mockAuthService.signIn(email, password);

        if (mockError) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }

        if (mockUser) {
          setUser(mockUser as any);
          const storedProfile = localStorage.getItem('medilink_profile');
          if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            setProfile(profile);
          } else {
            const derivedProfile: User = {
              id: mockUser.id,
              full_name: email.split('@')[0],
              mobile_number: email.split('@')[0],
              user_type: userType || 'patient',
              preferred_language: 'english',
            };
            localStorage.setItem('medilink_profile', JSON.stringify(derivedProfile));
            setProfile(derivedProfile);
          }
          return;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        // Fallback to mock auth on any error
        console.warn('Supabase error, falling back to mock auth');
        setUseMockAuth(true);
        return signIn(email, password, userType);
      }

      if (data.user) {
        setUser(data.user);
        const storedProfile = localStorage.getItem('medilink_profile');
        if (storedProfile) {
          try {
            const profile = JSON.parse(storedProfile);
            // Update profile with current user ID if it doesn't match
            if (profile.id !== data.user.id) {
              profile.id = data.user.id;
              localStorage.setItem('medilink_profile', JSON.stringify(profile));
            }
            setProfile(profile);
          } catch (parseError) {
            console.error('Error parsing stored profile:', parseError);
            // Create a new profile if parsing fails
            const emailName = email.split('@')[0];
            const preferredLanguage = (localStorage.getItem('medilink_language') as User['preferred_language']) || 'english';
            const derivedProfile: User = {
              id: data.user.id,
              full_name: emailName,
              mobile_number: emailName,
              user_type: userType || 'patient',
              preferred_language: preferredLanguage,
            };
            localStorage.setItem('medilink_profile', JSON.stringify(derivedProfile));
            setProfile(derivedProfile);
          }
        } else {
          // Create a minimal local profile if none exists (e.g., returning users on a fresh device)
          const emailName = email.split('@')[0];
          const preferredLanguage = (localStorage.getItem('medilink_language') as User['preferred_language']) || 'english';
          const derivedProfile: User = {
            id: data.user.id,
            full_name: emailName,
            mobile_number: emailName,
            user_type: userType || 'patient',
            preferred_language: preferredLanguage,
          };
          localStorage.setItem('medilink_profile', JSON.stringify(derivedProfile));
          setProfile(derivedProfile);
        }
      } else {
        throw new Error('Login failed. No user data received.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      // Handle network/fetch errors by falling back to mock auth
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn('Network error detected, using mock authentication');
        setUseMockAuth(true);
        return signIn(email, password, userType);
      }
      
      throw err;
    }
  };

  const signOut = async () => {
    if (useMockAuth) {
      await mockAuthService.signOut();
    } else {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('medilink_profile');
    setProfile(null);
    setUser(null);
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
