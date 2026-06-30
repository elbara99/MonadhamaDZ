import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import type { PaginatedResponse, ProjectCreate, ProjectRead, ProjectUpdate } from '../lib/api-types';

interface ProjectFilters { status?: string; province_code?: string; search?: string; sort_by?: string; sort_order?: string; page?: number; page_size?: number }

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
      const resp = await apiClient.get<PaginatedResponse<ProjectRead>>(`/projects?${params}`);
      return resp.data;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => { const resp = await apiClient.get<ProjectRead>(`/projects/${id}`); return resp.data; },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectCreate) => apiClient.post<ProjectRead>('/projects', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdate }) => apiClient.patch<ProjectRead>(`/projects/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); qc.invalidateQueries({ queryKey: ['project'] }); },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/projects/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }) });
}
