import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import type { DocumentCreate, DocumentRead, DocumentUpdate, PaginatedResponse } from '../lib/api-types';

interface DocumentFilters { document_type?: string; search?: string; sort_by?: string; sort_order?: string; page?: number; page_size?: number }

export function useDocuments(filters: DocumentFilters = {}) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
      const resp = await apiClient.get<PaginatedResponse<DocumentRead>>(`/documents?${params}`);
      return resp.data;
    },
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => { const resp = await apiClient.get<DocumentRead>(`/documents/${id}`); return resp.data; },
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DocumentCreate) => apiClient.post<DocumentRead>('/documents', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DocumentUpdate }) => apiClient.patch<DocumentRead>(`/documents/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); qc.invalidateQueries({ queryKey: ['document'] }); },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiClient.delete(`/documents/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }) });
}
