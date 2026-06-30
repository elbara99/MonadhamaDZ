import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import apiClient, { clearTokens, setTokens } from '../lib/api-client';
import type { LoginRequest, LoginResponse, UserRead } from '../lib/api-types';

interface AuthState {
  user: UserRead | null;
  isAuthenticated: boolean;
  setUser: (user: UserRead | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },
}));

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const resp = await apiClient.post<LoginResponse>('/auth/login', data);
      setTokens(resp.data.access_token, resp.data.refresh_token);
      const userResp = await apiClient.get<UserRead>('/users/me');
      setUser(userResp.data);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const resp = await apiClient.get<UserRead>('/users/me');
      setUser(resp.data);
      return resp.data;
    },
    enabled: useAuthStore.getState().isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch {
        // ignore
      }
    },
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}
