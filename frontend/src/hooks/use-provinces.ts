import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import type { PaginatedResponse, ProvinceCreate, ProvinceRead, ProvinceUpdate } from '../lib/api-types';

interface ProvinceFilters {
  region?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
}

export function useProvinces(filters: ProvinceFilters = {}) {
  return useQuery({
    queryKey: ['provinces', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
      const resp = await apiClient.get<PaginatedResponse<ProvinceRead>>(`/provinces?${params}`);
      return resp.data;
    },
  });
}

export function useProvince(code: string) {
  return useQuery({
    queryKey: ['province', code],
    queryFn: async () => {
      const resp = await apiClient.get<ProvinceRead>(`/provinces/${code}`);
      return resp.data;
    },
    enabled: !!code,
  });
}

export function useCreateProvince() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProvinceCreate) => apiClient.post<ProvinceRead>('/provinces', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provinces'] }),
  });
}

export function useUpdateProvince() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: ProvinceUpdate }) =>
      apiClient.patch<ProvinceRead>(`/provinces/${code}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['provinces'] }); qc.invalidateQueries({ queryKey: ['province'] }); },
  });
}

export function useDeleteProvince() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => apiClient.delete(`/provinces/${code}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provinces'] }),
  });
}
