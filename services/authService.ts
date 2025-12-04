import { supabase } from './supabaseClient';
import { User, UserRole } from '../types';

// Helper to map "admin" username to a valid email format for Supabase
const normalizeEmail = (input: string) => {
  if (input.toLowerCase() === 'admin') {
    return 'admin@astrotrade.local';
  }
  return input;
};

export const authService = {
  // --- Auth Methods ---
  
  login: async (emailOrUsername: string, password: string): Promise<{ user: User | null; error?: string }> => {
    const email = normalizeEmail(emailOrUsername);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      // Fetch role from metadata or profiles table
      // We prioritize metadata for speed, but syncing with profiles is better practice
      const role = data.user.user_metadata?.role as UserRole || 'user';
      
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        role: role,
        createdAt: new Date(data.user.created_at).getTime()
      };
      
      return { user };
    }
    
    return { user: null, error: 'Login failed' };
  },

  signUp: async (email: string, password: string): Promise<{ user: User | null; error?: string }> => {
    // Default role is user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'user'
        }
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        role: 'user',
        createdAt: Date.now()
      };
      return { user };
    }

    return { user: null, error: 'Signup failed' };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getSession: async (): Promise<User | null> => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
       const u = data.session.user;
       return {
         id: u.id,
         email: u.email || '',
         role: (u.user_metadata?.role as UserRole) || 'user',
         createdAt: new Date(u.created_at).getTime()
       };
    }
    return null;
  },

  // --- Admin Methods ---

  getAllUsers: async (): Promise<User[]> => {
    // We query the 'profiles' table which we will create via SQL
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data.map((p: any) => ({
      id: p.id,
      email: p.email,
      role: p.role,
      createdAt: new Date(p.created_at).getTime(),
      password: '***' // Cannot retrieve hash
    }));
  },

  updateUserPassword: async (id: string, newPassword: string) => {
    // Client-side SDK cannot update ANOTHER user's password directly for security.
    // However, if it's the CURRENT user, we can.
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && user.id === id) {
      await supabase.auth.updateUser({ password: newPassword });
    } else {
      // For Admin managing others: trigger a reset password email
      // Note: We need the email to do this.
      console.warn("Admin cannot directly set passwords for others via client SDK. Use reset password email.");
    }
  },
  
  sendPasswordReset: async (email: string) => {
      await supabase.auth.resetPasswordForEmail(email);
  },

  deleteUser: async (id: string) => {
    // Soft delete: We can delete from 'profiles'. 
    // Hard delete from Auth requires Service Role Key (Backend).
    await supabase.from('profiles').delete().eq('id', id);
  }
};