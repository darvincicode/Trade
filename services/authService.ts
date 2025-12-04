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
    // 1. HARDCODED ADMIN ACCESS (As requested)
    // This allows login even if the user doesn't exist in Supabase yet.
    if (emailOrUsername.toLowerCase() === 'admin' && password === '123456') {
      return {
        user: {
          id: 'admin-master-id',
          email: 'admin@astrotrade.local',
          role: 'admin',
          createdAt: Date.now()
        }
      };
    }

    // 2. Standard Supabase Login
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
    // Check if we have a mock session in local storage or just rely on Supabase
    // For this demo, we'll check Supabase first.
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
    // Try to fetch real data
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    // If Supabase tables aren't set up yet or return error, return MOCK DATA
    // so the admin panel is "filled with database" as requested.
    if (error || !data || data.length === 0) {
      console.warn("Using Mock Data for Admin Panel (Database not connected or empty)");
      return [
        {
          id: 'admin-master-id',
          email: 'admin@astrotrade.local',
          role: 'admin',
          createdAt: Date.now() - 1000000,
          password: '***'
        },
        {
          id: 'user-001',
          email: 'trader_pro@gmail.com',
          role: 'user',
          createdAt: Date.now() - 500000,
          password: '***'
        },
        {
          id: 'user-002',
          email: 'crypto_whale@yahoo.com',
          role: 'user',
          createdAt: Date.now() - 250000,
          password: '***'
        },
        {
          id: 'user-003',
          email: 'newbie_investor@outlook.com',
          role: 'user',
          createdAt: Date.now() - 10000,
          password: '***'
        }
      ];
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
    const { data: { user } } = await supabase.auth.getUser();
    
    // Allow updating if it's the current user OR if it's our hardcoded admin
    if (id === 'admin-master-id' || (user && user.id === id)) {
      if (id !== 'admin-master-id') {
         await supabase.auth.updateUser({ password: newPassword });
      } else {
        console.log("Mock Admin Password 'Updated' (In-memory only)");
      }
    } else {
      console.warn("Admin cannot directly set passwords for others via client SDK.");
    }
  },
  
  sendPasswordReset: async (email: string) => {
      await supabase.auth.resetPasswordForEmail(email);
  },

  deleteUser: async (id: string) => {
    if (id.startsWith('user-')) {
       console.log("Mock user deleted");
       return;
    }
    await supabase.from('profiles').delete().eq('id', id);
  }
};