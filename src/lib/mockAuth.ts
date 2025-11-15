// Mock authentication service for development/testing when Supabase is unavailable
import { User as SupabaseUser } from '@supabase/supabase-js';

interface MockUser {
  id: string;
  email: string;
  created_at: string;
  app_metadata: any;
  user_metadata: any;
  aud: string;
}

class MockAuthService {
  private users: Map<string, { email: string; password: string; user: MockUser }> = new Map();
  private currentUser: MockUser | null = null;

  async signUp(email: string, password: string, metadata?: any): Promise<{ user: MockUser; error: null } | { user: null; error: Error }> {
    console.log('[MockAuth] Starting signup for:', email);
    
    // Load existing users from localStorage first
    const storedUsers = localStorage.getItem('mock_users');
    if (storedUsers) {
      try {
        this.users = new Map(JSON.parse(storedUsers));
      } catch (e) {
        console.warn('[MockAuth] Failed to parse stored users');
      }
    }
    
    // Check if user already exists
    if (this.users.has(email)) {
      console.log('[MockAuth] User already exists:', email);
      return {
        user: null,
        error: new Error('User already registered with this email')
      };
    }

    const user: MockUser = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: metadata || {},
      aud: 'authenticated'
    };

    this.users.set(email, { email, password, user });
    this.currentUser = user;
    
    // Store in localStorage for persistence
    localStorage.setItem('mock_users', JSON.stringify(Array.from(this.users.entries())));
    localStorage.setItem('mock_current_user', JSON.stringify(user));

    console.log('[MockAuth] Signup successful for:', email);
    return { user, error: null };
  }

  async signIn(email: string, password: string): Promise<{ user: MockUser; error: null } | { user: null; error: Error }> {
    try {
      // Load users from localStorage
      const storedUsers = localStorage.getItem('mock_users');
      if (storedUsers) {
        this.users = new Map(JSON.parse(storedUsers));
      }

      const userRecord = this.users.get(email);
      
      if (!userRecord) {
        return {
          user: null,
          error: new Error('Invalid login credentials')
        };
      }

      if (userRecord.password !== password) {
        return {
          user: null,
          error: new Error('Invalid login credentials')
        };
      }

      this.currentUser = userRecord.user;
      localStorage.setItem('mock_current_user', JSON.stringify(userRecord.user));

      return { user: userRecord.user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('mock_current_user');
  }

  getSession(): { user: MockUser | null } {
    if (this.currentUser) {
      return { user: this.currentUser };
    }

    // Try to restore from localStorage
    const storedUser = localStorage.getItem('mock_current_user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        return { user: this.currentUser };
      } catch {
        return { user: null };
      }
    }

    return { user: null };
  }
}

export const mockAuthService = new MockAuthService();
