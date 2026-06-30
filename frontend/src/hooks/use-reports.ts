import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import type { PaginatedResponse, ReportCreate, ReportRead, ReportUpdate } from '../lib/api-types';

interface ReportFilters { search?: string; sort_by?: string; sort_order?: string; page?: number; page_size?: number }

export function useReports(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
      const resp = await apiClient.get<PaginatedResponse<ReportRead>>(`/reports?${params}`);
      return resp.data;
    },
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: async () => { const resp = await apiClient.get<ReportRead>(`/reports/${id}`); return resp.data; },
    enabled: !!id,
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportCreate) => apiClient.post<ReportRead>('/reports', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });
}

export function useUpdateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReportUpdate }) => apiClient.patch<ReportRead>(`/reports/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); qc.invalidateQueries({ queryKey: ['report'] }); },
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/reports/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }) });
}
