import { User } from '../types';

const USERS_KEY = 'astro_auth_users';
const SESSION_KEY = 'astro_auth_session';

// Seed default admin if not exists
const seedAdmin = () => {
  if (typeof window === 'undefined') return;
  const usersStr = localStorage.getItem(USERS_KEY);
  let users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  if (!users.find(u => u.email === 'admin')) {
    const adminUser: User = {
      id: 'admin-id',
      email: 'admin',
      password: '123456', // In a real app, this would be hashed
      role: 'admin',
      createdAt: Date.now()
    };
    users.push(adminUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

seedAdmin();

export const authService = {
  // --- Auth Methods ---
  
  login: async (email: string, password: string): Promise<{ user: User | null; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const safeUser = { ...user };
      delete safeUser.password; // Don't return password in session
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      return { user: safeUser };
    }
    
    return { user: null, error: 'Invalid email or password' };
  },

  signUp: async (email: string, password: string): Promise<{ user: User | null; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find(u => u.email === email)) {
      return { user: null, error: 'User already exists' };
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password,
      role: 'user',
      createdAt: Date.now()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login after signup
    const safeUser = { ...newUser };
    delete safeUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));

    return { user: safeUser };
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  // --- Admin Methods ---

  getAllUsers: (): User[] => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    // Return users without passwords for display, except we need to manage them internally
    return users; 
  },

  updateUserPassword: (id: string, newPassword: string) => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  },

  deleteUser: (id: string) => {
    let users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    users = users.filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};