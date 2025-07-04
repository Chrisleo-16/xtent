
import { createContext, useContext, ReactNode } from 'react';
import { AuthProvider as AuthProviderHook, useAuth } from '@/hooks/useAuth';

// Export the auth hook for components to use
export const useAuthContext = useAuth;

// Export the proper AuthProvider
export const AuthProvider = AuthProviderHook;
