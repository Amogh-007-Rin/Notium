import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export const useUploadCSV = () =>
  useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return apiClient.post('/data/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
  });

export const useDataQuality = () =>
  useQuery({
    queryKey: ['data', 'quality'],
    queryFn: () => apiClient.get('/data/quality').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useUploadHistory = () =>
  useQuery({
    queryKey: ['data', 'uploads'],
    queryFn: () => apiClient.get('/data/uploads').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useAuditLogs = (page: number = 1) =>
  useQuery({
    queryKey: ['audit', 'logs', page],
    queryFn: () => apiClient.get('/audit/logs', { params: { page, limit: 50 } }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });
