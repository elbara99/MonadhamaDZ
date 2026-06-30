import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import type { OrganizationCreate, OrganizationRead, OrganizationUpdate, PaginatedResponse } from '../lib/api-types';

interface OrgFilters { search?: string; sort_by?: string; sort_order?: string; page?: number; page_size?: number }

export function useOrganizations(filters: OrgFilters = {}) {
  return useQuery({
    queryKey: ['organizations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
      const resp = await apiClient.get<PaginatedResponse<OrganizationRead>>(`/organizations?${params}`);
      return resp.data;
    },
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: async () => { const resp = await apiClient.get<OrganizationRead>(`/organizations/${id}`); return resp.data; },
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrganizationCreate) => apiClient.post<OrganizationRead>('/organizations', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrganizationUpdate }) => apiClient.patch<OrganizationRead>(`/organizations/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['organizations'] }); qc.invalidateQueries({ queryKey: ['organization'] }); },
  });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/organizations/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }) });
}
