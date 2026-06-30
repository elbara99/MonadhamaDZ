import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import type { IndicatorCreate, IndicatorRead, IndicatorUpdate, PaginatedResponse } from '../lib/api-types';

interface IndicatorFilters { province_code?: string; year?: number; name?: string; search?: string; sort_by?: string; sort_order?: string; page?: number; page_size?: number }

export function useIndicators(filters: IndicatorFilters = {}) {
  return useQuery({
    queryKey: ['indicators', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
      const resp = await apiClient.get<PaginatedResponse<IndicatorRead>>(`/indicators?${params}`);
      return resp.data;
    },
  });
}

export function useIndicator(id: string) {
  return useQuery({
    queryKey: ['indicator', id],
    queryFn: async () => { const resp = await apiClient.get<IndicatorRead>(`/indicators/${id}`); return resp.data; },
    enabled: !!id,
  });
}

export function useCreateIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: IndicatorCreate) => apiClient.post<IndicatorRead>('/indicators', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['indicators'] }),
  });
}

export function useUpdateIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IndicatorUpdate }) => apiClient.patch<IndicatorRead>(`/indicators/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['indicators'] }); qc.invalidateQueries({ queryKey: ['indicator'] }); },
  });
}

export function useDeleteIndicator() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/indicators/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['indicators'] }) });
}
