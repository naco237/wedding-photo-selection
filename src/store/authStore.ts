import { create } from 'zustand';

interface AuthState {
  isClientAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  accessCode: string | null;
  adminToken: string | null;
  expiryDate: Date | null;
  loginClient: (code: string) => Promise<void>;
  loginAdmin: (username: string, password: string) => Promise<void>;
  logoutClient: () => void;
  logoutAdmin: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isClientAuthenticated: false,
  isAdminAuthenticated: false,
  accessCode: null,
  adminToken: null,
  expiryDate: null,

  loginClient: async (code: string) => {
    // Ici, ajoutez la logique de validation avec le backend
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90);
    set({ 
      isClientAuthenticated: true, 
      accessCode: code, 
      expiryDate 
    });
  },

  loginAdmin: async (username: string, password: string) => {
    // Ici, ajoutez la logique d'authentification admin avec le backend
    set({ 
      isAdminAuthenticated: true, 
      adminToken: 'admin-token-example' 
    });
  },

  logoutClient: () => set({ 
    isClientAuthenticated: false, 
    accessCode: null, 
    expiryDate: null 
  }),

  logoutAdmin: () => set({ 
    isAdminAuthenticated: false, 
    adminToken: null 
  }),
}));